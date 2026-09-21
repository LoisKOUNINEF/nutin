import { MockEventBus } from './mock-event-bus.js';

describe('MockEventBus', () => {
  it('on() + emit() dispatches the event data to the registered handler', () => {
    const bus = new MockEventBus();
    let received;
    bus.on('greet', (data) => { received = data; });

    bus.emit('greet', 'hello');

    expect(received).toBe('hello');
    expect(bus.emit.calls).toEqual([['greet', 'hello']]);
  });

  it('on() is a trackable mock', () => {
    const bus = new MockEventBus();
    const handler = () => {};
    bus.on('greet', handler);

    expect(bus.on).toHaveBeenCalled();
    expect(bus.on).toHaveBeenCalledWith('greet', handler);
  });

  it('off() removes a previously registered handler', () => {
    const bus = new MockEventBus();
    let callCount = 0;
    const handler = () => { callCount++; };
    bus.on('greet', handler);
    bus.off('greet', handler);

    bus.emit('greet', 'hello');

    expect(callCount).toBe(0);
  });

  it('subscribe() is a bare mock and does not actually register a handler', () => {
    const bus = new MockEventBus();
    let called = false;
    const handler = () => { called = true; };
    bus.subscribe('greet', handler);

    bus.emit('greet', 'hello');

    expect(called).toBeFalsy();
    expect(bus.subscribe.calls.length).toBe(1);
    expect(bus.subscribe.calls[0][0]).toBe('greet');
    expect(bus.subscribe.calls[0][1]).toBe(handler);
  });

  it('reset() clears handlers and call logs', () => {
    const bus = new MockEventBus();
    let callCount = 0;
    bus.on('greet', () => { callCount++; });
    bus.emit('greet', 'x');
    bus.subscribe('greet', () => {});

    bus.reset();

    expect(bus.emit.calls).toEqual([]);
    expect(bus.subscribe.calls).toEqual([]);
    expect(bus.on.calls).toEqual([]);

    bus.emit('greet', 'y');
    expect(callCount).toBe(1); // only the pre-reset emit reached the handler
  });
});
