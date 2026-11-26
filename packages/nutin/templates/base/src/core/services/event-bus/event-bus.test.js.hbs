import { EventBus } from '#root/dist/src/core/services/index.js'
import { AppEventBus, BaseComponent, Navigation, useEventBus } from '#root/dist/src/core/index.js';
import { MockEventBus } from '#root/tools/testin-nutin/mocks/mock-event-bus.js';

describe('EventBus', () => {
  const eventBus = EventBus.getInstance();

  afterEach(() => {      
    eventBus.cleanupEventListeners();
    EventBus.testingResetAll();
  });

  it('should create a singleton instance', () => {
    const instance1 = EventBus.getInstance();
    const instance2 = EventBus.getInstance();
      
    expect(instance1).toBe(instance2);
  });

  it('should subscribe and emit events', () => {
    let receivedData = null;
      
    eventBus.subscribe('user-login', (data) => {
      receivedData = data;
    });
      
    const testData = { userId: '123', timestamp: Date.now() };
    eventBus.emit('user-login', testData);
      
    expect(receivedData).toBe(testData);
  });

  it('should handle multiple subscribers for same event', () => {
    let callCount = 0;
    let receivedData1 = null;
    let receivedData2 = null;
      
    eventBus.subscribe('notification', (data) => {
      callCount++;
      receivedData1 = data;
    });
      
    eventBus.subscribe('notification', (data) => {
      callCount++;
      receivedData2 = data;
    });
      
    const testData = { message: 'test', type: 'info' };
    eventBus.emit('notification', testData);
      
    expect(callCount).toBe(2);
    expect(receivedData1).toBe(testData);
    expect(receivedData2).toBe(testData);
  });

  it('should unsubscribe handlers correctly', () => {
    let callCount = 0;
      
    const handler = () => callCount++;
    eventBus.subscribe('data-update', handler);
      
    eventBus.emit('data-update', { id: '1', value: 'test' });
    expect(callCount).toBe(1);
      
    eventBus.off('data-update', handler);
    eventBus.emit('data-update', { id: '2', value: 'test2' });
    expect(callCount).toBe(1);
  });

  it('should handle unsubscribing non-existent handler', () => {
    let calls = 0;
    const handler1 = () => { calls++; };
    const handler2 = () => {};
      
    eventBus.subscribe('test-event', handler1);
      
    eventBus.off('test-event', handler2);
    eventBus.emit('test-event');
    expect(calls).toBe(1);
  });

  it('should handle unsubscribing from non-existent event', () => {
    const handler = () => {};
      
    eventBus.off('non-existent-event', handler);  
  });

  it('should handle emit without data', () => {
    let called = false;
    let receivedData = 'not-called';
      
    eventBus.subscribe('notification', (data) => {
      called = true;
      receivedData = data;
    });
      
    eventBus.emit('notification');
      
    expect(called).toBe(true);
    expect(receivedData).toBeUndefined();
  });

  it('should handle emit to non-existent event', () => {    
    eventBus.emit('non-existent-event', { data: 'test' });      
  });

  it('should cleanup event listeners', () => {
    let calls = 0;
    eventBus.subscribe('user-login', () => { calls++; });
    eventBus.subscribe('notification', () => { calls++; });

    eventBus.cleanupEventListeners();
    eventBus.emit('user-login', {});
    eventBus.emit('notification', {});

    expect(calls).toBe(0);
  });
  it('should reset specific service instance', () => {
    const instance1 = EventBus.getInstance();    
    EventBus.testingReset();
      
    const instance2 = EventBus.getInstance();
    
    expect(instance1).not.toBe(instance2);
  });
  it('should reset all service instances', () => {
    const eventBus1 = EventBus.getInstance();

    EventBus.testingResetAll();

    const eventBus2 = EventBus.getInstance();

    expect(eventBus1).not.toBe(eventBus2);
  });

  it('should only invoke a once() handler on the first emit', () => {
    let callCount = 0;
    eventBus.once('user-login', () => { callCount++; });

    eventBus.emit('user-login', { userId: '1' });
    expect(callCount).toBe(1);

    eventBus.emit('user-login', { userId: '2' });
    expect(callCount).toBe(1);
  });

  it('should forget a once() subscription after it fires, so a later subscribe() of the same callback stays', () => {
    let calls = 0;
    const callback = () => { calls++; };
    eventBus.once('user-login', callback);
    eventBus.emit('user-login', {});

    // A leftover once() record would make this emit remove the regular subscription.
    eventBus.subscribe('user-login', callback);
    eventBus.emit('user-login', {});
    eventBus.emit('user-login', {});

    expect(calls).toBe(3);
  });

  it('should not remove a once() subscription before it has fired', () => {
    let calls = 0;
    eventBus.once('user-login', () => { calls++; });
    eventBus.emit('notification', {});
    eventBus.emit('user-login', {});
    expect(calls).toBe(1);
  });

  it('should let a once() handler and a regular subscriber on the same event coexist', () => {
    let onceCalls = 0;
    let regularCalls = 0;
    eventBus.once('notification', () => { onceCalls++; });
    eventBus.subscribe('notification', () => { regularCalls++; });

    eventBus.emit('notification', {});
    expect(onceCalls).toBe(1);
    expect(regularCalls).toBe(1);

    eventBus.emit('notification', {});
    expect(onceCalls).toBe(1);
    expect(regularCalls).toBe(2);
  });

  it('with the same callback subscribed and once()d, one emit calls it twice and removes both, in either order', () => {
    let calls = 0;
    const callback = () => { calls++; };
    eventBus.subscribe('user-login', callback);
    eventBus.once('user-login', callback);
    eventBus.emit('user-login', {});
    eventBus.emit('user-login', {});
    expect(calls).toBe(2);

    calls = 0;
    eventBus.once('notification', callback);
    eventBus.subscribe('notification', callback);
    eventBus.emit('notification', {});
    eventBus.emit('notification', {});
    expect(calls).toBe(2);
  });

  it('dispatches to the handlers subscribed when emit() started, even if one unsubscribes another', () => {
    const calls = [];
    const second = () => calls.push('second');
    eventBus.subscribe('notification', () => {
      calls.push('first');
      eventBus.off('notification', second);
      eventBus.subscribe('notification', () => calls.push('late'));
    });
    eventBus.subscribe('notification', second);

    eventBus.emit('notification', {});
    expect(calls).toEqual(['first', 'second']);
  });

  it('keeps dispatching to the other listeners when one throws, and still removes a throwing once() handler', () => {
    const errSpy = spyOn(console, 'error').andCallFake(() => {});
    try {
      let received = 0;
      let onceCalls = 0;

      eventBus.once('notification', () => { onceCalls++; throw new Error('boom'); });
      eventBus.subscribe('notification', () => { received++; });

      eventBus.emit('notification', {});
      eventBus.emit('notification', {});

      expect(onceCalls).toBe(1);
      expect(received).toBe(2);
      expect(errSpy.callCount).toBe(1);
    } finally {
      errSpy.restore();
    }
  });

  it('off(event) with no callback removes every handler for that event', () => {
    let callsA = 0;
    let callsB = 0;
    eventBus.subscribe('notification', () => { callsA++; });
    eventBus.subscribe('notification', () => { callsB++; });

    eventBus.off('notification');
    eventBus.emit('notification', {});

    expect(callsA).toBe(0);
    expect(callsB).toBe(0);
  });

  it('off(event) with no callback does not affect other events', () => {
    let called = false;
    eventBus.subscribe('user-login', () => { called = true; });

    eventBus.off('notification');
    eventBus.emit('user-login', {});

    expect(called).toBe(true);
  });
});

describe('useEventBus', () => {
  let mock;

  beforeEach(() => {
    mock = new MockEventBus();
    useEventBus(mock);
  });

  afterEach(() => {
    useEventBus(null);
    AppEventBus.cleanupEventListeners();
  });

  it('routes AppEventBus\'s subscribe, once, emit and off to the bus given', () => {
    const received = [];
    const callback = (data) => received.push(data);
    AppEventBus.subscribe('navigate', callback);
    AppEventBus.subscribe('test-delegation', callback);
    AppEventBus.once('reload', callback);
    AppEventBus.emit('navigate', { path: '/a' });
    AppEventBus.off('navigate', callback);
    AppEventBus.emit('navigate', { path: '/b' });

    expect(mock.subscribe).toHaveBeenCalledWith('navigate', callback);
    expect(mock.once).toHaveBeenCalledWith('reload', callback);
    expect(mock.emit).toHaveBeenCalledWith('navigate', { path: '/a' });
    expect(mock.off).toHaveBeenCalledWith('navigate', callback);
    expect(received).toEqual([{ path: '/a' }]);
    // Nothing reached the real bus.
    useEventBus(null);
    AppEventBus.emit('test-delegation', 'real bus');
    expect(received).toEqual([{ path: '/a' }]);
  });

  it('covers the facades and components\' listen(), which go through AppEventBus', () => {
    Navigation.navigateTo('/about');
    expect(mock.emit).toHaveBeenCalledWith('navigate', { path: '/about' });

    class Listener extends BaseComponent {
      constructor() {
        super({});
        this.listen('reload', () => {});
      }
      generateTemplate() {
        return '';
      }
    }
    const component = new Listener();
    expect(mock.handlers.reload.length).toBe(1);
    component.destroy();
    expect(mock.handlers.reload.length).toBe(0);
  });

  it('restores the real bus with null', () => {
    useEventBus(null);
    let received = null;
    AppEventBus.subscribe('navigate', (data) => { received = data; });
    AppEventBus.emit('navigate', { path: '/real' });
    expect(received).toEqual({ path: '/real' });
    expect(mock.emit.calls.length).toBe(0);
  });
});
