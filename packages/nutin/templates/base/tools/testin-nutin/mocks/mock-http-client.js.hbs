import { createMockMethod } from './create-mock-method.js';

const METHODS = ['get', 'post', 'put', 'patch', 'delete', 'addRequestInterceptor', 'addResponseInterceptor', 'onDestroy'];

// Mirrors HttpClient's public API; every method is a bare mock (configure responses
// with e.g. `client.get.mockReturnValue(Promise.resolve(data))`).
export class MockHttpClient {
  constructor() {
    for (const method of METHODS) {
      this[method] = createMockMethod();
    }
    this.reset = this.reset.bind(this);
  }

  reset() {
    for (const method of METHODS) {
      this[method].mockReset();
    }
  }
}
