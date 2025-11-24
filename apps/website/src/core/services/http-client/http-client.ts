import { Service } from "../../index.js";
import { HttpBuilder, HttpMethod, IRequestConfig } from "./helpers/http-builder.helper.js";
import { HttpManager } from "./helpers/http-manager.helper.js";

export type IHttpClient = InstanceType<typeof HttpClient>;

export class HttpClient extends Service<HttpClient> {
  private _baseUrl: string;
  private _defaultHeaders: Record<string, string>;

  private _requestInterceptors: Array<(url: string, options: RequestInit) => void> = [];
  private _responseInterceptors: Array<(response: Response) => void> = [];

  constructor(baseUrl: string = '', defaultHeaders: Record<string, string> = {}) {
    super();
    this._baseUrl = baseUrl;
    this._defaultHeaders = { 'Content-Type': 'application/json', ...defaultHeaders };
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

  public addResponseInterceptor(fn: (response: Response) => void): void {
    this._responseInterceptors.push(fn);
  }

  protected onDestroy(): void {
    this._baseUrl = '';
    this._defaultHeaders = {};
    this._requestInterceptors = [];
    this._responseInterceptors = [];
  }

  private async request<T>(
    method: HttpMethod,
    endpoint: string,
    data?: unknown,
    config?: IRequestConfig
  ): Promise<T> {
    const { controller, timeoutId } = HttpManager.createAbortController(config?.timeout);
    const fullUrl = `${this._baseUrl}${endpoint}`;
    const mergedConfig = { ...this._defaultHeaders, ...config };

    try {
      const url = HttpBuilder.buildRequestUrl(fullUrl, config?.queryParams);
      const requestOptions = HttpBuilder.buildRequestOptions(method, data, mergedConfig, controller.signal);

      this._requestInterceptors.forEach(fn => fn(url.toString(), requestOptions));

      const response = await fetch(url.toString(), requestOptions);

      this._responseInterceptors.forEach(fn => fn(response));

      await HttpManager.validateResponse(response);
      return await HttpManager.parseSuccessResponse<T>(response);
    } catch (error) {
      HttpManager.handleRequestError(error);
    } finally {
      HttpManager.cleanupTimeout(timeoutId);
    }
  }
}

export const AppHttpClient = HttpClient.getInstance();
