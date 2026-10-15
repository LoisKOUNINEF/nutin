import * as HttpManager from '#root/dist/src/core/services/http-client/helpers/http-manager.helper.js';
import { HttpError } from '#root/dist/src/core/services/http-client/helpers/http-manager.helper.js';

describe('HttpManager', () => {
  it('should create an AbortController with a timeout', () => {
    const { controller, timeoutId } = HttpManager.createAbortController(10);
    expect(controller).toBeInstanceOf(AbortController);
    expect(timeoutId).toBeDefined();
    HttpManager.cleanupTimeout(timeoutId);
  });

  it('should create an AbortController without a timeout', () => {
    const { controller, timeoutId, timedOut } = HttpManager.createAbortController();
    expect(controller).toBeInstanceOf(AbortController);
    expect(timeoutId).toBe(null);
    expect(timedOut()).toBe(false);
  });

  it('should mark the request as timed out when its timeout fires', async () => {
    const { controller, timedOut, cleanup } = HttpManager.createAbortController(5);
    await new Promise((resolve) => setTimeout(resolve, 30));
    expect(controller.signal.aborted).toBe(true);
    expect(timedOut()).toBe(true);
    cleanup();
  });

  it('should reject a timeout that is not a positive number', () => {
    expect(() => HttpManager.createAbortController(0)).toThrow('positive number');
    expect(() => HttpManager.createAbortController(-5)).toThrow('positive number');
  });

  it('should forward an abort from the caller signal, and stop forwarding after cleanup', () => {
    const caller = new AbortController();
    const first = HttpManager.createAbortController(undefined, caller.signal);
    caller.abort();
    expect(first.controller.signal.aborted).toBe(true);
    expect(first.timedOut()).toBe(false);

    const other = new AbortController();
    const second = HttpManager.createAbortController(undefined, other.signal);
    second.cleanup();
    other.abort();
    expect(second.controller.signal.aborted).toBe(false);
  });

  it('should start aborted when the caller signal already is', () => {
    const caller = new AbortController();
    caller.abort();
    expect(HttpManager.createAbortController(undefined, caller.signal).controller.signal.aborted).toBe(true);
  });

  it('parses a JSON error response into the HttpError', async () => {
    const mockResponse = new Response(JSON.stringify({ error: 'Invalid' }), {
      status: 422,
      headers: { 'Content-Type': 'application/json' }
    });
    const error = await HttpManager.validateResponse(mockResponse).catch((e) => e);
    expect(JSON.stringify(error.response)).toBe(JSON.stringify({ error: 'Invalid' }));
  });

  it('gives the HttpError a null response for a non-JSON error body', async () => {
    const mockResponse = new Response('Not JSON', {
      status: 500,
      headers: { 'Content-Type': 'text/plain' }
    });
    const error = await HttpManager.validateResponse(mockResponse).catch((e) => e);
    expect(error.status).toBe(500);
    expect(error.response).toBe(null);
  });

  it('should not throw for ok responses in validateResponse', async () => {
    const mockResponse = new Response('OK', { status: 200 });
    await HttpManager.validateResponse(mockResponse); // no throw
  });

  it('should throw HttpError for failed response in validateResponse', async () => {
    const mockResponse = new Response(JSON.stringify({ error: 'Bad' }), {
      status: 400,
      statusText: 'Bad Request',
      headers: { 'Content-Type': 'application/json' }
    });

    let thrown = false;
    try {
      await HttpManager.validateResponse(mockResponse);
    } catch (e) {
      thrown = true;
      expect(e).toBeInstanceOf(HttpError);
      expect(e.status).toBe(400);
      expect(e.statusText).toBe('Bad Request');
      expect(JSON.stringify(e.response)).toBe(JSON.stringify({ error: 'Bad' }));
    }
    expect(thrown).toBe(true);
  });

  it('should throw HttpError with a null response body when the error body is not valid JSON', async () => {
    const mockResponse = new Response('plain text failure', {
      status: 500,
      statusText: 'Internal Server Error',
      headers: { 'Content-Type': 'text/plain' }
    });

    let thrown = false;
    try {
      await HttpManager.validateResponse(mockResponse);
    } catch (e) {
      thrown = true;
      expect(e).toBeInstanceOf(HttpError);
      expect(e.status).toBe(500);
      expect(e.statusText).toBe('Internal Server Error');
      expect(e.response).toBe(null);
    }
    expect(thrown).toBe(true);
  });

  it('parses JSON and +json content types, and returns anything else as text', async () => {
    const parse = (contentType) => HttpManager.parseSuccessResponse(new Response('{"a":1}', contentType ? { headers: { 'Content-Type': contentType } } : {}));
    for (const type of ['application/json', 'application/json; charset=utf-8', 'Application/JSON', 'application/problem+json']) {
      expect(await parse(type)).toEqual({ a: 1 });
    }
    for (const type of ['application/jsonp', 'text/html', null]) {
      expect(await parse(type)).toBe('{"a":1}');
    }
  });

  it('should parse success JSON response', async () => {
    const mockResponse = new Response(JSON.stringify({ message: 'ok' }), {
      headers: { 'Content-Type': 'application/json' }
    });
    const result = await HttpManager.parseSuccessResponse(mockResponse);
    expect(JSON.stringify(result)).toBe(JSON.stringify({ message: 'ok' }));
  });

  it('should resolve 204, 205 and empty bodies to undefined', async () => {
    expect(await HttpManager.parseSuccessResponse(new Response(null, { status: 204 }))).toBe(undefined);
    expect(await HttpManager.parseSuccessResponse(new Response(null, { status: 205 }))).toBe(undefined);
    const empty = new Response('', { headers: { 'Content-Type': 'application/json' } });
    expect(await HttpManager.parseSuccessResponse(empty)).toBe(undefined);
  });

  it('should parse success text response as fallback', async () => {
    const mockResponse = new Response('plain text', {
      headers: { 'Content-Type': 'text/plain' }
    });
    const result = await HttpManager.parseSuccessResponse(mockResponse);
    expect(result).toBe('plain text');
  });

  it('reports only an AbortError as a timeout', () => {
    expect(() => HttpManager.handleRequestError(new DOMException('Aborted', 'AbortError'), true)).toThrow('Request timed out');
    expect(() => HttpManager.handleRequestError(new Error('Other'), true)).toThrow('Other');
  });

  it('should rethrow an abort that was not the timeout as it is', () => {
    expect(() => HttpManager.handleRequestError(new DOMException('Aborted', 'AbortError'))).toThrow('Aborted');
  });

  it('should throw timeout error from handleRequestError', () => {
    const err = new DOMException('Aborted', 'AbortError');
    let thrown = false;
    try {
      HttpManager.handleRequestError(err, true);
    } catch (e) {
      thrown = true;
      expect(e.message).toBe('Request timed out');
    }
    expect(thrown).toBe(true);
  });

  it('should rethrow non-timeout error in handleRequestError', () => {
    const err = new Error('Network failure');
    let thrown = false;
    try {
      HttpManager.handleRequestError(err);
    } catch (e) {
      thrown = true;
      expect(e).toBe(err);
    }
    expect(thrown).toBe(true);
  });

  it('should cleanup timeout', () => {
    const id = setTimeout(() => {}, 50);
    HttpManager.cleanupTimeout(id);
    expect(true).toBe(true); // Just checking no errors
  });

  it('should ignore null timeout in cleanupTimeout', () => {
    HttpManager.cleanupTimeout(null);
    expect(true).toBe(true); // Just checking no errors
  });
});
