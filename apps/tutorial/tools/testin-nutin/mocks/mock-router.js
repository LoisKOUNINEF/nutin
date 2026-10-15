import { createMockMethod } from './create-mock-method.js';

// Mirrors Router's public API. Route params are seeded with setParams() and read back
// through the real getCurrentParams()/getParam() shapes.
export class MockRouter {
  constructor(routes = {}) {
    this.routes = routes;
    this._currentParams = {};

    this.navigate = createMockMethod(async () => {});
    this.reload = createMockMethod(async () => {});
    this.getCurrentParams = createMockMethod(() => ({ ...this._currentParams }));
    this.getParam = createMockMethod((key) => this._currentParams[key]);
    this.removeEventListeners = createMockMethod();
    this.onDestroy = createMockMethod();
  }

  setParams(params) {
    this._currentParams = { ...params };
  }

  reset() {
    this.navigate.mockReset();
    this.reload.mockReset();
    this.getCurrentParams.mockReset();
    this.getParam.mockReset();
    this.removeEventListeners.mockReset();
    this.onDestroy.mockReset();
    this._currentParams = {};
  }
}
