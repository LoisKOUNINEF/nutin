export type TimeoutType = ReturnType<typeof setTimeout> | null;

export interface IAbortControllerSetup {
  controller: AbortController;
  timeoutId: TimeoutType;
  // True once the timeout (not the caller's signal) aborted the request.
  timedOut: () => boolean;
  // Detaches the caller's signal and clears the timeout.
  cleanup: () => void;
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
  public static createAbortController(timeout?: number, signal?: AbortSignal): IAbortControllerSetup {
    if (timeout !== undefined && !(timeout > 0)) {
      throw new Error(`timeout must be a positive number of milliseconds, got ${timeout}.`);
    }

    const controller = new AbortController();
    let timedOut = false;
    const timeoutId = timeout
      ? setTimeout(() => {
          timedOut = true;
          controller.abort();
        }, timeout)
      : null;

    const forwardAbort = () => controller.abort(signal?.reason);
    if (signal?.aborted) forwardAbort();
    else signal?.addEventListener('abort', forwardAbort, { once: true });

    return {
      controller,
      timeoutId,
      timedOut: () => timedOut,
      cleanup: () => {
        this.cleanupTimeout(timeoutId);
        signal?.removeEventListener('abort', forwardAbort);
      },
    };
  }

  public static async validateResponse(response: Response): Promise<void> {
    if (!response.ok) {
      await this.handleResponseError(response);
    }
  }

  // JSON (application/json or any +json type) is parsed; an empty body (204, 205, or no
  // content) resolves to undefined; anything else is returned as text.
  public static async parseSuccessResponse<T>(response: Response): Promise<T> {
    if (response.status === 204 || response.status === 205) return undefined as T;

    const text = await response.text();
    if (text === '') return undefined as T;
    if (this.isJsonResponse(response.headers.get('content-type'))) return JSON.parse(text);
    return text as unknown as T;
  }

  // Only the client's own timeout is reported as "Request timed out": an abort from the
  // caller's signal is rethrown as it is.
  public static handleRequestError(error: unknown, timedOut = false): never {
    if (timedOut && this.isAbortError(error)) {
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
    const mediaType = ((contentType ?? '').split(';')[0] as string).trim().toLowerCase();
    return mediaType === 'application/json' || mediaType.endsWith('+json');
  }

  private static async safeParseErrorResponse(response: Response): Promise<unknown> {
    try {
      return await response.json();
    } catch {
      return null;
    }
  }

  private static isAbortError(error: unknown): boolean {
    return (error as { name?: unknown } | null)?.name === 'AbortError';
  }
}
