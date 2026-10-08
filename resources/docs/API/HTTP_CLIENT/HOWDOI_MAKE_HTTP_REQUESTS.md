# How do I make HTTP requests?

```ts
import { AppHttpClient, HttpClient, Service, path } from '../core/index.js';

export class UsersService extends Service<UsersService> {
  constructor() { super(); }

  public getUsers() {
    return AppHttpClient.get<{ id: number; name: string }[]>('/api/users', {
      queryParams: { page: 1 },
      timeout: 5000,
    });
  }

  public getUser(id: string) {
    return AppHttpClient.get(path`/api/users/${id}`);
  }

  public createUser(payload: { name: string }) {
    return AppHttpClient.post('/api/users', payload);
  }
}
```

```ts
get<T = unknown>(endpoint: string, config?: IRequestConfig): Promise<T>;
post<T = unknown>(endpoint: string, data?: unknown, config?: IRequestConfig): Promise<T>;
put<T = unknown>(endpoint: string, data?: unknown, config?: IRequestConfig): Promise<T>;
patch<T = unknown>(endpoint: string, data?: unknown, config?: IRequestConfig): Promise<T>;
delete<T = unknown>(endpoint: string, config?: IRequestConfig): Promise<T>;
```

`AppHttpClient` is the framework's default `HttpClient` singleton, without a base URL: a relative endpoint (`/api/users`) is resolved against the page's origin, and an absolute one (`https://…`) is used as it is. Only `http:` and `https:` URLs are accepted.

```ts
interface IRequestConfig {
  headers?: Record<string, string>;
  queryParams?: Record<string, string | number | boolean | null | undefined | Array<…>>;
  timeout?: number;            // ms, > 0; throws Error('Request timed out') when exceeded
  signal?: AbortSignal;        // your own cancellation; its abort is rethrown as it is
  credentials?: RequestCredentials;
  cache?: RequestCache;
  referrerPolicy?: ReferrerPolicy;
  redirect?: RequestRedirect;  // fetch's default: 'follow'
}
```

`queryParams` values are converted to strings; `null`/`undefined` ones are skipped, and an array repeats the key (`tag=a&tag=b`).

## Request bodies

- A plain value (object, array, number, boolean, string) is sent as JSON, with `Content-Type: application/json` unless you set another one. `0`, `false` and `''` are sent too; only `null`/`undefined` mean "no body".
- `FormData`, `Blob`, `URLSearchParams`, `ArrayBuffer`/typed arrays and `ReadableStream` are sent as they are, and the browser sets their content type (e.g. multipart boundaries for `FormData`).
- Requests without a body (GET, DELETE) don't send a `Content-Type`, so a plain cross-origin GET needs no CORS preflight.

Headers are merged case-insensitively: a per-call `content-type` replaces a default `Content-Type`.

## Responses

- `application/json` and any `+json` type (`application/problem+json`, …) are parsed.
- A 204/205 or an empty body resolves to `undefined`.
- Anything else is returned as text, so the return type isn't guaranteed to match `T` for non-JSON APIs.
- A non-OK response throws `HttpError` (exported from `core/index`): `.status`, `.statusText`, and `.response`, the parsed JSON error body or `null`.

## Base URL

A subclass can set a base URL, default headers and options:

```ts
class ApiClient extends HttpClient {
  constructor() {
    super('https://api.example.com/v1', { Authorization: `Bearer ${token}` });
  }
}

ApiClient.getInstance().get(path`/users/${userId}`);
```

The endpoint is resolved against the base URL, and the request is rejected (an `Error`, before `fetch`) if the result isn't on the base URL's origin and under its path, so a value in the endpoint can't send your default headers to another host, or reach `/admin` through `../`. A query string in the base URL (`?version=2`) is kept, ahead of the endpoint's own.

Without a base URL, default headers are only sent to the page's own origin. Headers you pass per call are sent wherever that call goes.

## Redirects

Redirects are followed (fetch's default), but a redirect must end where the request was allowed to go: under the base URL, or, without one, on the origin you requested. Otherwise the call throws, and the other origin's response never reaches your code or your response interceptors.

Browsers remove `Authorization` when they follow a redirect to another origin, but they **keep other headers**. If your API authenticates with a custom header (`X-Api-Key`, …), a redirect to another origin would still send that header there once, before the client rejects the response. For such APIs, refuse redirects altogether:

```ts
api.get('/reports', { redirect: 'error' });
```

## Values in paths: `path`

Build endpoints from values with the `path` tag. Each value is encoded as one path segment, and `.`/`..` are rejected:

```ts
api.get(path`/users/${id}/files/${name}`); // name "a b" → /users/42/files/a%20b
```

An encoded `/` or `\` (`%2F`, `%5C`) in a path is rejected, because many servers decode it back into a separator. So a value containing `/` is rejected too. If an API really expects them (e.g. file keys like `a%2Fb`), list it in `trustedAPIs`:

```ts
class FilesClient extends HttpClient {
  constructor() {
    super('https://files.example.com/api', {}, { trustedAPIs: ['https://files.example.com/api/objects/'] });
  }
}
```

A URL is trusted when it has the same origin as an entry and its path is under the entry's path, segment by segment: `/api/v1` covers `/api/v1/users` but not `/api/v10`.

## Interceptors

```ts
AppHttpClient.addRequestInterceptor((url, options) => console.log('→', url, options));
AppHttpClient.addResponseInterceptor((response) => console.log('←', response.status));
```

The request interceptor fires once per call, right before `fetch`, with the final URL and request options (`options.headers` is a `Headers` object). The response interceptor fires right after `fetch` resolves, **before** error-status validation, so it sees failed (4xx/5xx) responses too. Each response interceptor gets its own `response.clone()`: reading its body doesn't consume the response the client parses.
