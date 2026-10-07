import { Service } from "../../base-classes/service/service.js";
import * as HttpBuilder from "./helpers/http-builder.helper.js";
import * as HttpManager from "./helpers/http-manager.helper.js";

export { path } from "./helpers/http-builder.helper.js";
export { HttpError } from "./helpers/http-manager.helper.js";

export class HttpClient extends Service<HttpClient> {
  private _baseUrl: string;
  private _defaultHeaders: Record<string, string>;
  private _trustedAPIs: string[];

  private _requestInterceptors: Array<(url: string, options: RequestInit) => void> = [];
  private _responseInterceptors: Array<(response: Response) => void> = [];

  constructor(
    baseUrl: string = '',
    defaultHeaders: Record<string, string> = {},
    options: IHttpClientOptions = {}
  ) {
    super();
    this._baseUrl = baseUrl;
    this._defaultHeaders = { ...defaultHeaders };
    this._trustedAPIs = [...(options.trustedAPIs ?? [])];
  }

  public get<T = unknown>(endpoint: string, config?: IRequestConfig): Promise<T> {
    return this.request<T>('GET', endpoint, null, config);
  }
  public post<T = unknown>(endpoint: string, data?: unknown, config?: IRequestConfig): Promise<T> {
    return this.request<T>('POST', endpoint, data, config);
  }
  public put<T = unknown>(endpoint: string, data?: unknown, config?: IRequestConfig): Promise<T> {
    return this.request<T>('PUT', endpoint, data, config);
  }
  public patch<T = unknown>(endpoint: string, data?: unknown, config?: IRequestConfig): Promise<T> {
    return this.request<T>('PATCH', endpoint, data, config);
  }
  public delete<T = unknown>(endpoint: string, config?: IRequestConfig): Promise<T> {
    return this.request<T>('DELETE', endpoint, undefined, config);
  }

  public addRequestInterceptor(fn: (url: string, options: RequestInit) => void): void {
    this._requestInterceptors.push(fn);
  }

  // Each interceptor gets its own clone, so reading the body there doesn't consume it.
  public addResponseInterceptor(fn: (response: Response) => void): void {
    this._responseInterceptors.push(fn);
  }

  protected onDestroy(): void {
    this._baseUrl = '';
    this._defaultHeaders = {};
    this._trustedAPIs = [];
    this._requestInterceptors = [];
    this._responseInterceptors = [];
  }

  private async request<T>(
    method: HttpMethod,
    endpoint: string,
    data?: unknown,
    config: IRequestConfig = {}
  ): Promise<T> {
    const abort = HttpManager.createAbortController(config.timeout, config.signal);

    try {
      const url = HttpBuilder.resolveUrl(this._baseUrl, endpoint, this._trustedAPIs);
      HttpBuilder.appendQueryParams(url, config.queryParams);

      // Without a base URL, the client's default headers only go to the page's own origin;
      // per-call headers are sent wherever the call goes.
      const sendDefaults = this._baseUrl !== '' || url.origin === window.location.origin;
      const headers = HttpBuilder.mergeHeaders(sendDefaults ? this._defaultHeaders : undefined, config.headers);
      const requestOptions = HttpBuilder.buildRequestOptions(method, data, config, headers, abort.controller.signal);

      this._requestInterceptors.forEach(fn => fn(url.toString(), requestOptions));

      const response = await fetch(url.toString(), requestOptions);
      // Checked before interceptors: another origin's response is never handed to app code.
      if (response.redirected) HttpBuilder.assertRedirectTarget(this._baseUrl, url, response.url);

      this._responseInterceptors.forEach(fn => fn(response.clone()));

      await HttpManager.validateResponse(response);
      return await HttpManager.parseSuccessResponse<T>(response);
    } catch (error) {
      HttpManager.handleRequestError(error, abort.timedOut());
    } finally {
      abort.cleanup();
    }
  }
}

export const AppHttpClient = /* @__PURE__ */ HttpClient.getInstance();
