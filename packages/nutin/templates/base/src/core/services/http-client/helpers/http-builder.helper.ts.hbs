export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

/**
 * headers?: Record<string, string>;
 * queryParams?: Record<string, string>;
 * timeout?: number;
 */
export interface IRequestConfig {
  headers?: Record<string, string>;
  queryParams?: Record<string, string>;
  timeout?: number;
}

export class HttpBuilder {
  static buildRequestBody(data: unknown): string | undefined {
    return data ? JSON.stringify(data) : undefined;
  }

  static buildRequestUrl(endpoint: string, queryParams?: Record<string, string>): URL {
    const url = new URL(endpoint);
    
    if (queryParams) {
      this.appendQueryParams(url, queryParams);
    }

    return url;
  }

  static appendQueryParams(url: URL, queryParams: Record<string, string>): void {
    Object.entries(queryParams).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });
  }

  static buildRequestOptions(
    method: HttpMethod,
    data: unknown,
    config: IRequestConfig,
    signal: AbortSignal
  ): RequestInit {
    return {
      method,
      headers: config.headers,
      body: this.buildRequestBody(data),
      signal
    };
  }
}
