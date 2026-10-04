import { MockEventBus } from './mock-event-bus.js';

describe('MockEventBus', () => {
  it('subscribe() + emit() dispatches the event data to the subscribed callback', () => {
    const bus = new MockEventBus();
    let received;
    bus.subscribe('greet', (data) => { received = data; });

    bus.emit('greet', 'hello');

    expect(received).toBe('hello');
    expect(bus.emit.calls).toEqual([['greet', 'hello']]);
  });

  it('subscribe() is a trackable mock', () => {
    const bus = new MockEventBus();
    const handler = () => {};
    bus.subscribe('greet', handler);

    expect(bus.subscribe).toHaveBeenCalledWith('greet', handler);
  });

  it('once() callbacks run for the first emit only', () => {
    const bus = new MockEventBus();
    let callCount = 0;
    bus.once('greet', () => { callCount++; });

    bus.emit('greet');
    bus.emit('greet');

    expect(callCount).toBe(1);
  });

  it('off(event, callback) removes that callback only', () => {
    const bus = new MockEventBus();
    let removed = 0;
    let kept = 0;
    const handler = () => { removed++; };
    bus.subscribe('greet', handler);
    bus.subscribe('greet', () => { kept++; });
    bus.off('greet', handler);

    bus.emit('greet', 'hello');

    expect(removed).toBe(0);
    expect(kept).toBe(1);
  });

  it('off(event) removes every callback for that event', () => {
    const bus = new MockEventBus();
    let callCount = 0;
    bus.subscribe('greet', () => { callCount++; });
    bus.off('greet');

    bus.emit('greet');

    expect(callCount).toBe(0);
  });

  it('reset() clears handlers and call logs', () => {
    const bus = new MockEventBus();
    let callCount = 0;
    bus.subscribe('greet', () => { callCount++; });
    bus.emit('greet', 'x');

    bus.reset();

    expect(bus.emit.calls).toEqual([]);
    expect(bus.subscribe.calls).toEqual([]);

    bus.emit('greet', 'y');
    expect(callCount).toBe(1); // only the pre-reset emit reached the handler
  });
});
