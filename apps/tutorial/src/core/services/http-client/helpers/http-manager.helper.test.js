import { HttpManager, HttpError } from '#root/dist/src/core/services/http-client/helpers/http-manager.helper.js';

describe('HttpManager', () => {
  it('should create an AbortController with a timeout', () => {
    const { controller, timeoutId } = HttpManager.createAbortController(10);
    expect(controller).toBeInstanceOf(AbortController);
    expect(timeoutId).toBeDefined();
    HttpManager.cleanupTimeout(timeoutId);
  });

  it('should create an AbortController without a timeout', () => {
    const { controller, timeoutId } = HttpManager.createAbortController();
    expect(controller).toBeInstanceOf(AbortController);
    expect(timeoutId).toBe(null);
  });

  it('should parse a valid JSON error response', async () => {
    const mockResponse = new Response(JSON.stringify({ error: 'Invalid' }), {
      headers: { 'Content-Type': 'application/json' }
    });
    const result = await HttpManager.safeParseErrorResponse(mockResponse);
    expect(JSON.stringify(result)).toBe(JSON.stringify({ error: 'Invalid' }));
  });

  it('should return null for non-JSON error response', async () => {
    const mockResponse = new Response('Not JSON', {
      headers: { 'Content-Type': 'text/plain' }
    });
    const result = await HttpManager.safeParseErrorResponse(mockResponse);
    expect(result).toBe(null);
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

  it('should detect JSON content types', () => {
    expect(HttpManager.isJsonResponse('application/json')).toBe(true);
    expect(HttpManager.isJsonResponse('application/json; charset=utf-8')).toBe(true);
    expect(HttpManager.isJsonResponse('text/html')).toBe(false);
    expect(HttpManager.isJsonResponse(null)).toBe(false);
  });

  it('should parse success JSON response', async () => {
    const mockResponse = new Response(JSON.stringify({ message: 'ok' }), {
      headers: { 'Content-Type': 'application/json' }
    });
    const result = await HttpManager.parseSuccessResponse(mockResponse);
    expect(JSON.stringify(result)).toBe(JSON.stringify({ message: 'ok' }));
  });

  it('should parse success text response as fallback', async () => {
    const mockResponse = new Response('plain text', {
      headers: { 'Content-Type': 'text/plain' }
    });
    const result = await HttpManager.parseSuccessResponse(mockResponse);
    expect(result).toBe('plain text');
  });

  it('should detect timeout errors', () => {
    const err = new DOMException('Aborted', 'AbortError');
    expect(HttpManager.isTimeoutError(err)).toBe(true);

    const otherErr = new Error('Other');
    expect(HttpManager.isTimeoutError(otherErr)).toBe(false);
  });

  it('should throw timeout error from handleRequestError', () => {
    const err = new DOMException('Aborted', 'AbortError');
    let thrown = false;
    try {
      HttpManager.handleRequestError(err);
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
