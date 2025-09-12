import { createMockMethod } from './create-mock-method.js';

export class MockStore {
  constructor() {
    this._state = {};

    this.set = createMockMethod((key, value) => {
      this._state[key] = value;
    });

    this.get = createMockMethod((key) => {
      return this._state[key];
    });

    this.subscribe = createMockMethod();
    this.unsubscribe = createMockMethod();

    this.clear = createMockMethod(() => {
      this._state = {};
    });

    this.onDestroy = createMockMethod();
    this.disposeStore = createMockMethod(() => {
      this.clear();
    });
  }

  reset() {
    this.set.mockReset();
    this.get.mockReset();
    this.subscribe.mockReset();
    this.unsubscribe.mockReset();
    this.clear.mockReset();
    this.onDestroy.mockReset();
    this.disposeStore.mockReset();
    this._state = {};
  }
}
