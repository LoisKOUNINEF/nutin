import { createMockMethod } from './create-mock-method.js';

export class MockRouter {
  constructor(routes = {}) {
    this.routes = routes;
    this._currentView = null;

    this.navigate = createMockMethod();
    this.handlePopState = createMockMethod();
    this.handleNotFound = createMockMethod();
    this.handleGuards = createMockMethod();
    this.initializeEventListeners = createMockMethod();
  }

  reset() {
    this.navigate.mockReset();
    this.handlePopState.mockReset();
    this.handleNotFound.mockReset();
    this.handleGuards.mockReset();
    this.initializeEventListeners.mockReset();
    this._currentView = null;
  }
}
