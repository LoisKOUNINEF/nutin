import { Service } from "../../index.js";
import { HttpBuilder, HttpMethod, IRequestConfig } from "./helpers/http-builder.helper.js";
import { HttpManager } from "./helpers/http-manager.helper.js";

/**
 * IHttpClient is a type alias for the instance of HttpClient, not a true interface 
 */
export type IHttpClient = InstanceType<typeof HttpClient>;

export class HttpClient extends Service<HttpClient> {
  private _baseUrl: string;
  private _defaultHeaders: Record<string, string>;

  constructor(baseUrl: string = '', defaultHeaders: Record<string, string> = {}) {
    super();
    this._baseUrl = baseUrl;
    this._defaultHeaders = {
      'Content-Type': 'application/json',
      ...defaultHeaders
    };
  }

  onDestroy(): void {
    this._baseUrl = '';
    this._defaultHeaders = {};
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

      const response = await fetch(url.toString(), requestOptions);
      
      await HttpManager.validateResponse(response);
      return await HttpManager.parseSuccessResponse<T>(response);
    } catch (error) {
      HttpManager.handleRequestError(error);
    } finally {
      HttpManager.cleanupTimeout(timeoutId);
    }
  }

  public async get<T = unknown>(endpoint: string, config?: IRequestConfig): Promise<T> {
    return this.request<T>('GET', endpoint, null, config);
  }

  public async post<T = unknown>(endpoint: string, data?: unknown, config?: IRequestConfig): Promise<T> {
    return this.request<T>('POST', endpoint, data, config);
  }

  public async put<T = unknown>(endpoint: string, data?: unknown, config?: IRequestConfig): Promise<T> {
    return this.request<T>('PUT', endpoint, data, config);
  }

  public async patch<T = unknown>(endpoint: string, data?: unknown, config?: IRequestConfig): Promise<T> {
    return this.request<T>('PATCH', endpoint, data, config);
  }

  public async delete<T = unknown>(endpoint: string, config?: IRequestConfig): Promise<T> {
    return this.request<T>('DELETE', endpoint, undefined, config);
  }
}

export const AppHttpClient = HttpClient.getInstance();
