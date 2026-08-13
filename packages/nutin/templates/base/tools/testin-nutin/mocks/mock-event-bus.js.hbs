import { createMockMethod } from './create-mock-method.js';

export class MockEventBus {
  constructor() {
    this.handlers = {};

    this.subscribe = createMockMethod();
    this.emit = (...args) => {
      this.emit.calls.push(args);
      const [event, data] = args;
      const callbacks = this.handlers[event];
      if (callbacks) {
        callbacks.forEach(cb => cb(data));
      }
    };
    this.emit.calls = [];
    this.emit.mockReset = () => { this.emit.calls = []; };

    this.off = (event, callback) => {
      this.off.calls.push([event, callback]);
      if (!this.handlers[event]) return;
      this.handlers[event] = this.handlers[event].filter(cb => cb !== callback);
    };
    this.off.calls = [];
    this.off.mockReset = () => { this.off.calls = []; };

    this.on = (event, callback) => {
      if (!this.handlers[event]) this.handlers[event] = [];
      this.handlers[event].push(callback);
    };

    this.onDestroy = createMockMethod();
    this.reset = this.reset.bind(this);
  }

  reset() {
    this.subscribe.mockReset();
    this.emit.mockReset();
    this.off.mockReset();
    this.onDestroy.mockReset();
    this.handlers = {};
  }
}

