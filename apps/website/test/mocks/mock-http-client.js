import { createMockMethod } from './create-mock-method.js';

export class MockHttpClient {
  constructor() {
    this._defineHttpMethods();
    this.onDestroy = createMockMethod();
    this.reset = this.reset.bind(this);
  }

  _defineHttpMethods() {
    const methods = ['get', 'post', 'put', 'patch', 'delete'];
    for (const method of methods) {
      this[method] = createMockMethod();
    }
  }

  reset() {
    const methods = ['get', 'post', 'put', 'patch', 'delete', 'onDestroy'];
    for (const method of methods) {
      this[method].mockReset();
    }
  }
}
