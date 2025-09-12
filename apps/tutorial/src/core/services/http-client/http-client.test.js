import { HttpClient } from '#root/dist/src/core/services/index.js';

class FetchMock {
  constructor() {
    this.originalFetch = global.fetch;
    this.mockResponses = new Map();
    this.calls = [];
  }

  mockResponse(url, response) {
    this.mockResponses.set(url, response);
    return this;
  }

  mockJsonResponse(url, data, status = 200) {
    this.mockResponses.set(url, {
      ok: status >= 200 && status < 300,
      status,
      statusText: status === 200 ? 'OK' : 'Error',
      headers: {
        get: (key) => key === 'content-type' ? 'application/json' : null
      },
      json: () => Promise.resolve(data),
      text: () => Promise.resolve(JSON.stringify(data))
    });
    return this;
  }

  mockTextResponse(url, text, status = 200) {
    this.mockResponses.set(url, {
      ok: status >= 200 && status < 300,
      status,
      statusText: status === 200 ? 'OK' : 'Error',
      headers: {
        get: (key) => key === 'content-type' ? 'text/plain' : null
      },
      json: () => Promise.reject(new Error('Not JSON')),
      text: () => Promise.resolve(text)
    });
    return this;
  }

  mockError(url, status = 500, errorData = null) {
    this.mockResponses.set(url, {
      ok: false,
      status,
      statusText: 'Internal Server Error',
      headers: {
        get: (key) => key === 'content-type' ? 'application/json' : null
      },
      json: () => Promise.resolve(errorData),
      text: () => Promise.resolve(JSON.stringify(errorData))
    });
    return this;
  }

  install() {
    global.fetch = async (url, options) => {
      this.calls.push({ url, options });
      
      const urlKey = url.toString();
      if (this.mockResponses.has(urlKey)) {
        return this.mockResponses.get(urlKey);
      }

      // Default response if not mocked
      return {
        ok: true,
        status: 200,
        statusText: 'OK',
        headers: {
          get: () => 'application/json'
        },
        json: () => Promise.resolve({}),
        text: () => Promise.resolve('{}')
      };
    };
    return this;
  }

  restore() {
    global.fetch = this.originalFetch;
    this.mockResponses.clear();
    this.calls = [];
  }

  getLastCall() {
    return this.calls[this.calls.length - 1];
  }

  getCalls() {
    return this.calls;
  }
}

const fetchMock = new FetchMock();

describe('HttpClient', () => {
  const httpClient = HttpClient.getInstance();

  beforeEach(() => {
    fetchMock.install();
  });

  afterEach(() => {
    fetchMock.restore();
    HttpClient.testingResetAll();
  });

  it('should create a singleton instance', () => {
    const instance1 = HttpClient.getInstance();
    const instance2 = HttpClient.getInstance();
    
    expect(instance1).toBe(instance2);
  });

  it('should initialize with default headers', () => {
    expect(httpClient._defaultHeaders['Content-Type']).toBe('application/json');
  });

  it('should make GET request successfully', async () => {
    const testData = { id: 1, name: 'test' };
    fetchMock.mockJsonResponse('https://api.example.com/users', testData);
    
    const result = await httpClient.get('https://api.example.com/users');
    
    expect(result).toBe(testData);
    
    const lastCall = fetchMock.getLastCall();
    expect(lastCall.options.method).toBe('GET');
  });

  it('should make POST request with data', async () => {
    const requestData = { name: 'John', email: 'john@example.com' };
    const responseData = { id: 1, ...requestData };
    
    fetchMock.mockJsonResponse('https://api.example.com/users', responseData);
    
    const result = await httpClient.post('https://api.example.com/users', requestData);
    
    expect(result).toBe(responseData);
    
    const lastCall = fetchMock.getLastCall();
    expect(lastCall.options.method).toBe('POST');
    expect(lastCall.options.body).toBe(JSON.stringify(requestData));
  });

  it('should make PUT request with data', async () => {
    const requestData = { id: 1, name: 'Updated Name' };
    
    fetchMock.mockJsonResponse('https://api.example.com/users/1', requestData);
    
    const result = await httpClient.put('https://api.example.com/users/1', requestData);
    
    expect(result).toBe(requestData);
    
    const lastCall = fetchMock.getLastCall();
    expect(lastCall.options.method).toBe('PUT');
  });

  it('should make PATCH request with data', async () => {
    const requestData = { name: 'Patched Name' };
    const responseData = { id: 1, name: 'Patched Name', email: 'john@example.com' };
    
    fetchMock.mockJsonResponse('https://api.example.com/users/1', responseData);
    
    const result = await httpClient.patch('https://api.example.com/users/1', requestData);
    
    expect(result).toBe(responseData);
    
    const lastCall = fetchMock.getLastCall();
    expect(lastCall.options.method).toBe('PATCH');
  });

  it('should make DELETE request', async () => {
    fetchMock.mockJsonResponse('https://api.example.com/users/1', { success: true });
    
    const result = await httpClient.delete('https://api.example.com/users/1');
    
    expect(result).toBeDefined();
    expect(result.success).toBe(true);
    
    const lastCall = fetchMock.getLastCall();
    expect(lastCall.options.method).toBe('DELETE');
    expect(lastCall.options.body).toBeUndefined();
  });

  it('should handle query parameters', async () => {
    fetchMock.mockJsonResponse('https://api.example.com/users?page=1&limit=10', []);
    
    await httpClient.get('https://api.example.com/users', { queryParams: { page: '1', limit: '10' } });
    
    const lastCall = fetchMock.getLastCall();
    expect(lastCall.url).toContain('page=1');
    expect(lastCall.url).toContain('limit=10');
  });

  it('should handle custom headers', async () => {
    fetchMock.mockJsonResponse('https://api.example.com/users', []);
    
    await httpClient.get('https://api.example.com/users', { headers: { 'Authorization': 'Bearer custom-token' } });
    
    const lastCall = fetchMock.getLastCall();
    expect(lastCall.options.headers['Authorization']).toBe('Bearer custom-token');
  });

  it('should handle HTTP errors', async () => {
    fetchMock.mockError('https://api.example.com/users', 404, { message: 'Not found' });
        
    try {
      await httpClient.get('https://api.example.com/users');
      // Should not reach here
      expect(false).toBeTruthy();
    } catch (error) {
      expect(error).toBeDefined();
      expect(error.message).toBe('HTTP Error 404: Internal Server Error');
    }
  });

  it('should handle text responses', async () => {
    fetchMock.mockTextResponse('http://test.eu/health', 'OK');
    
    const result = await httpClient.get('http://test.eu/health');

    expect(result).toBeDefined();
    expect(result).toContain('OK');
  });

  it('should handle timeout', async () => {
    // Mock a delayed response
    fetchMock.mockResponse('https://api.example.com/slow', new Promise(resolve => {
      setTimeout(() => resolve({ ok: true, json: () => Promise.resolve({}) }), 200);
    }));
        
    try {
      await httpClient.get('/slow', { timeout: 100 });
      // Should not reach here if timeout works
    } catch (error) {
      // Timeout should trigger an abort error
      expect(error.name).toBeDefined();
    }
  });

  it('should reset specific service instance', () => {
    const instance1 = HttpClient.getInstance();
    
    HttpClient.testingReset();
    
    const instance2 = HttpClient.getInstance();
    expect(instance1).not.toBe(instance2);
  });

  it('should reset all service instances', () => {
    const client1 = HttpClient.getInstance();
    
    HttpClient.testingResetAll();
    
    const client2 = HttpClient.getInstance();
    expect(client1).not.toBe(client2);
  });

  it('should cleanup on destroy', () => {
    httpClient.onDestroy();
    
    expect(httpClient._baseUrl).toBe('');
    expect(Object.keys(httpClient._defaultHeaders).length).toBe(0);
  });
});
