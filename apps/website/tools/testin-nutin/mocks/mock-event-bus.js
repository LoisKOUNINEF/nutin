import { createMockMethod } from './create-mock-method.js';

// Mirrors EventBus's public API (subscribe/once/emit/off): every method is a trackable
// mock whose default implementation really dispatches, so subscribed callbacks run.
export class MockEventBus {
  constructor() {
    this.handlers = {};

    this.subscribe = createMockMethod((event, callback) => this._addHandler(event, callback, false));
    this.once = createMockMethod((event, callback) => this._addHandler(event, callback, true));

    this.emit = createMockMethod((event, data) => {
      const entries = this.handlers[event];
      if (!entries) return;
      entries.slice().forEach((entry) => {
        if (entry.once) this._removeHandler(event, entry.callback);
        entry.callback(data);
      });
    });

    this.off = createMockMethod((event, callback) => {
      if (callback) this._removeHandler(event, callback);
      else delete this.handlers[event];
    });

    this.onDestroy = createMockMethod();
    this.reset = this.reset.bind(this);
  }

  _addHandler(event, callback, once) {
    (this.handlers[event] ??= []).push({ callback, once });
  }

  _removeHandler(event, callback) {
    if (!this.handlers[event]) return;
    this.handlers[event] = this.handlers[event].filter((entry) => entry.callback !== callback);
  }

  reset() {
    this.subscribe.mockReset();
    this.once.mockReset();
    this.emit.mockReset();
    this.off.mockReset();
    this.onDestroy.mockReset();
    this.handlers = {};
  }
}
