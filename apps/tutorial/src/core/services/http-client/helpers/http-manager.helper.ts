export type TimeoutType = ReturnType<typeof setTimeout> | null;

export interface IAbortControllerSetup {
  controller: AbortController;
  timeoutId: TimeoutType;
}

export class HttpError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    public response?: unknown
  ) {
    super(`HTTP Error ${status}: ${statusText}`);
  }
}

export class HttpManager {
  public static createAbortController(timeout?: number): IAbortControllerSetup {
    const controller = new AbortController();
    const timeoutId = timeout ? 
      setTimeout(() => controller.abort(), timeout) : 
      null;
    
    return { controller, timeoutId };
  }

  public static async validateResponse(response: Response): Promise<void> {
    if (!response.ok) {
      await this.handleResponseError(response);
    }
  }
  
  public static async parseSuccessResponse<T>(response: Response): Promise<T> {
    const contentType = response.headers.get('content-type');
    
    if (this.isJsonResponse(contentType)) {
      return await response.json();
    }
    
    return await response.text() as unknown as T;
  }

  public static handleRequestError(error: unknown): never {
    if (this.isTimeoutError(error)) {
      throw new Error('Request timed out');
    }
    throw error;
  }

  public static cleanupTimeout(timeoutId: TimeoutType | null): void {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  }

  private static async handleResponseError(response: Response): Promise<never> {
    const errorData = await this.safeParseErrorResponse(response);
    throw new HttpError(response.status, response.statusText, errorData);
  }

  private static isJsonResponse(contentType: string | null): boolean {
    return contentType?.includes('application/json') ?? false;
  }

  private static async safeParseErrorResponse(response: Response): Promise<unknown> {
    try {
      return await response.json();
    } catch {
      return null;
    }
  }

  private static isTimeoutError(error: unknown): boolean {
    return error instanceof DOMException && error.name === 'AbortError';
  }
}
