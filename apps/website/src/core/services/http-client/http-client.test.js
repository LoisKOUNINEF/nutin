import { HttpClient, HttpError, path } from '#root/dist/src/core/services/index.js';

// Records fetch calls and answers with real Response objects. A handler can return a
// Response, or a promise; requests honour their AbortSignal like the real fetch.
class FetchMock {
  constructor() {
    this.originalFetch = global.fetch;
    this.handlers = new Map();
    this.calls = [];
  }

  on(url, handler) {
    this.handlers.set(url, handler);
    return this;
  }

  json(url, data, status = 200, contentType = 'application/json') {
    return this.on(url, () => new Response(JSON.stringify(data), { status, headers: { 'content-type': contentType } }));
  }

  text(url, text, status = 200) {
    return this.on(url, () => new Response(text, { status, headers: { 'content-type': 'text/plain' } }));
  }

  install() {
    global.fetch = (url, options = {}) => {
      this.calls.push({ url, options });
      const handler = this.handlers.get(String(url));
      const result = handler ? handler(options) : new Response('{}', { headers: { 'content-type': 'application/json' } });
      return new Promise((resolve, reject) => {
        const signal = options.signal;
        if (signal) {
          if (signal.aborted) return reject(signal.reason ?? new DOMException('Aborted', 'AbortError'));
          signal.addEventListener('abort', () => reject(signal.reason ?? new DOMException('Aborted', 'AbortError')), { once: true });
        }
        Promise.resolve(result).then(resolve, reject);
      });
    };
    return this;
  }

  restore() {
    global.fetch = this.originalFetch;
    this.handlers.clear();
    this.calls = [];
  }

  last() {
    return this.calls[this.calls.length - 1];
  }
}

const fetchMock = new FetchMock();

// Same-origin as the test page (jsdom: http://localhost) unless a test says otherwise.
function clientClass(baseUrl = '', defaultHeaders = {}, options = {}) {
  return class extends HttpClient {
    constructor() {
      super(baseUrl, defaultHeaders, options);
    }
  };
}

async function errorOf(promise) {
  try {
    await promise;
  } catch (error) {
    return error;
  }
  return null;
}

const header = (call, name) => new Headers(call.options.headers).get(name);

// A Response as fetch returns it after following a redirect (redirected/url can't be set via the constructor).
function redirectedTo(finalUrl, data) {
  const response = new Response(JSON.stringify(data), { headers: { 'content-type': 'application/json' } });
  Object.defineProperty(response, 'redirected', { value: true });
  Object.defineProperty(response, 'url', { value: finalUrl });
  return response;
}

describe('HttpClient', () => {
  const httpClient = HttpClient.getInstance();

  beforeEach(() => {
    fetchMock.install();
  });

  afterEach(() => {
    fetchMock.restore();
    HttpClient.testingResetAll();
  });

  it('should create a singleton instance', () => {
    expect(HttpClient.getInstance()).toBe(HttpClient.getInstance());
  });

  it('should start without default headers', () => {
    expect(Object.keys(httpClient._defaultHeaders).length).toBe(0);
  });

  it('should make a GET request and parse the JSON response', async () => {
    fetchMock.json('https://api.example.com/users', { id: 1 });

    const result = await httpClient.get('https://api.example.com/users');

    expect(result).toEqual({ id: 1 });
    expect(fetchMock.last().options.method).toBe('GET');
    expect(fetchMock.last().options.body).toBeUndefined();
  });

  it('should send POST, PUT and PATCH data as JSON with a JSON content type', async () => {
    for (const method of ['post', 'put', 'patch']) {
      await httpClient[method]('https://api.example.com/users', { name: 'Ada' });

      expect(fetchMock.last().options.method).toBe(method.toUpperCase());
      expect(fetchMock.last().options.body).toBe('{"name":"Ada"}');
      expect(header(fetchMock.last(), 'content-type')).toBe('application/json');
    }
  });

  it('should make a DELETE request without a body', async () => {
    fetchMock.json('https://api.example.com/users/1', { success: true });

    const result = await httpClient.delete('https://api.example.com/users/1');

    expect(result.success).toBe(true);
    expect(fetchMock.last().options.method).toBe('DELETE');
    expect(fetchMock.last().options.body).toBeUndefined();
  });

  it('should not send a content type on requests without a body', async () => {
    await httpClient.get('https://api.example.com/users');
    expect(header(fetchMock.last(), 'content-type')).toBe(null);

    await httpClient.delete('https://api.example.com/users/1');
    expect(header(fetchMock.last(), 'content-type')).toBe(null);
  });

  it('should keep falsy JSON bodies', async () => {
    for (const data of [0, false, '']) {
      await httpClient.post('https://api.example.com/flags', data);
      expect(fetchMock.last().options.body).toBe(JSON.stringify(data));
    }
  });

  it('should send FormData, Blob, URLSearchParams and binary bodies as they are, without a JSON content type', async () => {
    const form = new FormData();
    form.append('name', 'Ada');
    const bodies = [form, new Blob(['x']), new URLSearchParams({ a: '1' }), new ArrayBuffer(2), new Uint8Array(2)];

    for (const body of bodies) {
      await httpClient.post('https://api.example.com/upload', body);
      expect(fetchMock.last().options.body).toBe(body);
      expect(header(fetchMock.last(), 'content-type')).toBe(null);
    }
  });

  it('should let an explicit content type win over the JSON default', async () => {
    await httpClient.post('https://api.example.com/users', { a: 1 }, { headers: { 'Content-Type': 'application/merge-patch+json' } });

    expect(header(fetchMock.last(), 'content-type')).toBe('application/merge-patch+json');
  });

  it('should merge default and per-call headers case-insensitively, per-call winning', async () => {
    const Api = clientClass('', { 'X-Client': 'nutin', Accept: 'application/json' });

    await Api.getInstance().get('/users', { headers: { accept: 'text/plain', 'X-Trace': '1' } });

    expect(header(fetchMock.last(), 'x-client')).toBe('nutin');
    expect(header(fetchMock.last(), 'accept')).toBe('text/plain');
    expect(header(fetchMock.last(), 'x-trace')).toBe('1');
  });

  it('should resolve a relative endpoint against the page origin when there is no base URL', async () => {
    await httpClient.get('/api/users');
    expect(fetchMock.last().url).toBe('http://localhost/api/users');

    await httpClient.get('api/users');
    expect(fetchMock.last().url).toBe('http://localhost/api/users');
  });

  it('should send default headers only to the page origin when there is no base URL', async () => {
    const Api = clientClass('', { Authorization: 'Bearer t' });
    const api = Api.getInstance();

    await api.get('/me');
    expect(header(fetchMock.last(), 'authorization')).toBe('Bearer t');

    await api.get('https://third-party.example/data');
    expect(header(fetchMock.last(), 'authorization')).toBe(null);

    await api.get('https://third-party.example/data', { headers: { Authorization: 'Bearer explicit' } });
    expect(header(fetchMock.last(), 'authorization')).toBe('Bearer explicit');
  });

  it('should resolve endpoints against a base URL and send default headers there', async () => {
    const Api = clientClass('https://api.example.com/v1', { Authorization: 'Bearer t' });

    await Api.getInstance().get('/users');

    expect(fetchMock.last().url).toBe('https://api.example.com/v1/users');
    expect(header(fetchMock.last(), 'authorization')).toBe('Bearer t');
  });

  it('should keep the base URL query before the endpoint query and query params', async () => {
    const Api = clientClass('https://api.example.com/v1?version=2');

    await Api.getInstance().get('/users?sort=name', { queryParams: { page: 1 } });

    expect(fetchMock.last().url).toBe('https://api.example.com/v1/users?version=2&sort=name&page=1');
  });

  it('should reject an endpoint outside the base URL without calling fetch', async () => {
    const Api = clientClass('https://api.example.com/v1', { Authorization: 'Bearer t' });

    const error = await errorOf(Api.getInstance().get('/../admin'));

    expect(error.message).toContain('outside the HttpClient base URL');
    expect(fetchMock.calls.length).toBe(0);
  });

  it('should reject non-http(s) URLs without calling fetch', async () => {
    const error = await errorOf(httpClient.get('ftp://files.example.com/report.csv'));

    expect(error.message).toContain('must use http or https');
    expect(fetchMock.calls.length).toBe(0);
  });

  it('should keep the query string out of error messages', async () => {
    const Api = clientClass('https://api.example.com/v1?key=secret');

    const error = await errorOf(Api.getInstance().get('https://other.example.com/x?token=secret'));

    expect(error.message.includes('secret')).toBe(false);
  });

  it('should reject an encoded "/" in the path unless the API is trusted', async () => {
    const Api = clientClass('https://api.example.com/v1');
    const error = await errorOf(Api.getInstance().get('/files/a%2Fb'));
    expect(error.message).toContain('trustedAPIs');
    expect(fetchMock.calls.length).toBe(0);

    const Trusted = clientClass('https://api.example.com/v1', {}, { trustedAPIs: ['https://api.example.com/v1/files/'] });
    await Trusted.getInstance().get('/files/a%2Fb');
    expect(fetchMock.last().url).toBe('https://api.example.com/v1/files/a%2Fb');
  });

  it('path`` encodes each value as one path segment', async () => {
    const Api = clientClass('https://api.example.com/v1');

    await Api.getInstance().get(path`/users/${'Ada Lovelace'}/posts/${42}`);

    expect(fetchMock.last().url).toBe('https://api.example.com/v1/users/Ada%20Lovelace/posts/42');
  });

  it('path`` rejects "." and ".." values, and a value containing "/" needs a trusted API', async () => {
    expect(() => path`/users/${'..'}`).toThrow();
    expect(() => path`/users/${'.'}`).toThrow();

    const Api = clientClass('https://api.example.com/v1');
    const error = await errorOf(Api.getInstance().get(path`/users/${'a/b'}`));
    expect(error.message).toContain('trustedAPIs');
  });

  it('should add query params, skipping null/undefined and repeating arrays', async () => {
    await httpClient.get('https://api.example.com/users', {
      queryParams: { page: 1, active: true, q: 'a b', skip: undefined, none: null, tag: ['x', 'y'] },
    });

    expect(fetchMock.last().url).toBe('https://api.example.com/users?page=1&active=true&q=a+b&tag=x&tag=y');
  });

  it('should accept a followed redirect that stays under the base URL', async () => {
    const Api = clientClass('https://api.example.com/v1');
    fetchMock.on('https://api.example.com/v1/old', () => redirectedTo('https://api.example.com/v1/new', { ok: 1 }));

    expect(await Api.getInstance().get('/old')).toEqual({ ok: 1 });
  });

  it('should reject a followed redirect that leaves the base URL, before response interceptors', async () => {
    const Api = clientClass('https://api.example.com/v1', { 'X-Api-Key': 'k' });
    const api = Api.getInstance();
    const seen = [];
    api.addResponseInterceptor((response) => seen.push(response.url));
    fetchMock.on('https://api.example.com/v1/moved', () => redirectedTo('https://other.example.com/data', { ok: 'other' }));
    fetchMock.on('https://api.example.com/v1/up', () => redirectedTo('https://api.example.com/admin', { ok: 'admin' }));

    const away = await errorOf(api.get('/moved'));
    const up = await errorOf(api.get('/up'));

    expect(away.message).toContain('was redirected to "https://other.example.com/data"');
    expect(up.message).toContain('outside the HttpClient base URL');
    expect(seen.length).toBe(0);
  });

  it('should reject a followed redirect to another origin when there is no base URL', async () => {
    fetchMock.on('http://localhost/api/me', () => redirectedTo('https://other.example.com/me', {}));
    fetchMock.on('http://localhost/api/old', () => redirectedTo('http://localhost/api/new', { ok: 1 }));

    const error = await errorOf(httpClient.get('/api/me'));

    expect(error.message).toContain('outside its origin');
    expect(await httpClient.get('/api/old')).toEqual({ ok: 1 });
  });

  it('should pass credentials, cache, referrerPolicy and redirect to fetch', async () => {
    await httpClient.get('https://api.example.com/users', {
      credentials: 'include',
      cache: 'no-store',
      referrerPolicy: 'no-referrer',
      redirect: 'error',
    });

    const options = fetchMock.last().options;
    expect(options.credentials).toBe('include');
    expect(options.cache).toBe('no-store');
    expect(options.referrerPolicy).toBe('no-referrer');
    expect(options.redirect).toBe('error');
  });

  it('should resolve 204 and empty responses to undefined', async () => {
    fetchMock.on('https://api.example.com/a', () => new Response(null, { status: 204, headers: { 'content-type': 'application/json' } }));
    fetchMock.on('https://api.example.com/b', () => new Response('', { status: 200, headers: { 'content-type': 'application/json' } }));

    expect(await httpClient.delete('https://api.example.com/a')).toBe(undefined);
    expect(await httpClient.get('https://api.example.com/b')).toBe(undefined);
  });

  it('should parse +json and charset-qualified JSON responses', async () => {
    fetchMock.json('https://api.example.com/a', { a: 1 }, 200, 'application/vnd.api+json');
    fetchMock.json('https://api.example.com/b', { b: 2 }, 200, 'Application/JSON; charset=utf-8');

    expect(await httpClient.get('https://api.example.com/a')).toEqual({ a: 1 });
    expect(await httpClient.get('https://api.example.com/b')).toEqual({ b: 2 });
  });

  it('should return non-JSON responses as text', async () => {
    fetchMock.text('https://api.example.com/health', 'OK');

    expect(await httpClient.get('https://api.example.com/health')).toBe('OK');
  });

  it('should reject a JSON response that does not parse', async () => {
    fetchMock.on('https://api.example.com/broken', () => new Response('not json', { headers: { 'content-type': 'application/json' } }));

    const error = await errorOf(httpClient.get('https://api.example.com/broken'));

    expect(error instanceof SyntaxError).toBe(true);
  });

  it('should throw HttpError with the parsed error body', async () => {
    fetchMock.json('https://api.example.com/users', { message: 'Not found' }, 404);

    const error = await errorOf(httpClient.get('https://api.example.com/users'));

    expect(error instanceof HttpError).toBe(true);
    expect(error.status).toBe(404);
    expect(error.response).toEqual({ message: 'Not found' });
  });

  it('should invoke request interceptors with the final url and options before sending', async () => {
    const api = clientClass().getInstance();
    const calls = [];
    api.addRequestInterceptor((url, options) => calls.push({ url, options }));

    await api.get('https://api.example.com/users');

    expect(calls.length).toBe(1);
    expect(calls[0].url).toBe('https://api.example.com/users');
    expect(calls[0].options.method).toBe('GET');
  });

  it('should give response interceptors a clone they can read without consuming the response', async () => {
    fetchMock.json('https://api.example.com/users', { id: 1 });
    const api = clientClass().getInstance();
    const seen = [];
    api.addResponseInterceptor(async (response) => seen.push(await response.json()));
    api.addResponseInterceptor(async (response) => seen.push(await response.json()));

    const result = await api.get('https://api.example.com/users');

    expect(result).toEqual({ id: 1 });
    expect(seen).toEqual([{ id: 1 }, { id: 1 }]);
  });

  it('should report its own timeout as "Request timed out"', async () => {
    fetchMock.on('https://api.example.com/slow', () => new Promise(() => {}));

    const error = await errorOf(httpClient.get('https://api.example.com/slow', { timeout: 20 }));

    expect(error.message).toBe('Request timed out');
  });

  it('should rethrow an abort from the caller signal as it is, not as a timeout', async () => {
    fetchMock.on('https://api.example.com/slow', () => new Promise(() => {}));
    const controller = new AbortController();

    const pending = errorOf(httpClient.get('https://api.example.com/slow', { signal: controller.signal, timeout: 5000 }));
    controller.abort();
    const error = await pending;

    expect(error.name).toBe('AbortError');
  });

  it('should not call fetch when the caller signal is already aborted', async () => {
    const controller = new AbortController();
    controller.abort();

    const error = await errorOf(httpClient.get('https://api.example.com/users', { signal: controller.signal }));

    expect(error.name).toBe('AbortError');
  });

  it('should reject a timeout that is not a positive number', async () => {
    for (const timeout of [0, -1, Number.NaN]) {
      const error = await errorOf(httpClient.get('https://api.example.com/users', { timeout }));
      expect(error.message).toContain('timeout must be a positive number');
    }
    expect(fetchMock.calls.length).toBe(0);
  });

  it('should reset specific service instance', () => {
    const instance1 = HttpClient.getInstance();
    HttpClient.testingReset();
    expect(HttpClient.getInstance()).not.toBe(instance1);
  });

  it('should reset all service instances', () => {
    const client1 = HttpClient.getInstance();
    HttpClient.testingResetAll();
    expect(HttpClient.getInstance()).not.toBe(client1);
  });

  it('should cleanup on destroy', () => {
    const Api = clientClass('https://api.example.com', { A: '1' }, { trustedAPIs: ['https://api.example.com/'] });
    const api = Api.getInstance();

    api.onDestroy();

    expect(api._baseUrl).toBe('');
    expect(Object.keys(api._defaultHeaders).length).toBe(0);
    expect(api._trustedAPIs.length).toBe(0);
  });
});
