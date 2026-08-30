# How do I make HTTP requests?

```ts
import { AppHttpClient, Service } from '../core/index.js';

export class UsersService extends Service<UsersService> {
  constructor() { super(); }

  public getUsers() {
    return AppHttpClient.get<{ id: number; name: string }[]>('/api/users', {
      queryParams: { page: '1' },
      timeout: 5000,
    });
  }

  public createUser(payload: { name: string }) {
    return AppHttpClient.post('/api/users', payload, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
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

`AppHttpClient` is the framework's default `HttpClient` singleton, constructed with an empty base URL. `IRequestConfig`/`HttpError` below aren't currently re-exported from `core/index.ts`, so they can't be imported directly — shown here for reference only:

```ts
interface IRequestConfig {
  headers?: Record<string, string>;
  queryParams?: Record<string, string>;
  timeout?: number;   // ms; aborts the request and throws `Error('Request timed out')` if exceeded
}

class HttpError extends Error {
  constructor(public status: number, public statusText: string, public response?: unknown);
}
```

A non-OK response throws `HttpError` — `.response` is the parsed JSON error body if the response was valid JSON, otherwise `null`. A response whose `content-type` isn't `application/json` is returned as plain text, so the return type isn't guaranteed to match `T` for non-JSON APIs.

## Interceptors

```ts
AppHttpClient.addRequestInterceptor((url, options) => console.log('→', url, options));
AppHttpClient.addResponseInterceptor((response) => console.log('←', response.status));
```

The request interceptor fires once per call, right before `fetch`, with the fully built URL and request options. The response interceptor fires with the raw `Response` right after `fetch` resolves — **before** error-status validation, so it sees failed (4xx/5xx) responses too, ahead of the `HttpError` throw.

## Gotcha: constructor default headers aren't sent

`HttpClient`'s constructor accepts `defaultHeaders` (e.g. `{ 'Content-Type': 'application/json' }`), but they currently aren't merged into the actual outgoing request — only headers passed explicitly via a call's own `config.headers` are sent. Don't rely on constructor defaults; pass headers per call when you need them, as in the `createUser` example above.
