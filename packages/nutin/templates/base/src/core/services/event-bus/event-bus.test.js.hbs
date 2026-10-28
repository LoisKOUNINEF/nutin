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
    const handler1 = () => {};
    const handler2 = () => {};
      
    eventBus.subscribe('test-event', handler1);
      
    eventBus.off('test-event', handler2);
    expect(eventBus.handlers['test-event'].length).toBe(1);
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

  it('should track subscriptions correctly', () => {      
    eventBus.subscribe('user-login', () => {});
    eventBus.subscribe('notification', () => {});
      
    expect(eventBus._subscriptions.length).toBe(2);
  });
  it('should cleanup event listeners', () => {
      
    eventBus.subscribe('user-login', () => {});
    eventBus.subscribe('notification', () => {});
      
    expect(eventBus._subscriptions.length).toBe(2);
      
    eventBus.cleanupEventListeners();
      
    expect(eventBus._subscriptions.length).toBe(0);
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

  it('should auto-unsubscribe a once() handler from _subscriptions after it fires', () => {
    eventBus.once('user-login', () => {});
    expect(eventBus._subscriptions.length).toBe(1);

    eventBus.emit('user-login', {});
    expect(eventBus._subscriptions.length).toBe(0);
  });

  it('should not remove a once() subscription before it has fired', () => {
    eventBus.once('user-login', () => {});
    eventBus.emit('notification', {});
    expect(eventBus._subscriptions.length).toBe(1);
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

  it('keeps dispatching to the other listeners when one throws, and still removes a throwing once() handler', () => {
    const errSpy = spyOn(console, 'error');
    errSpy.andCallFake(() => {});
    let received = 0;
    let onceCalls = 0;

    eventBus.once('notification', () => { onceCalls++; throw new Error('boom'); });
    eventBus.subscribe('notification', () => { received++; });

    eventBus.emit('notification', {});
    eventBus.emit('notification', {});

    expect(onceCalls).toBe(1);
    expect(received).toBe(2);
    expect(errSpy.callCount).toBe(1);
    errSpy.restore();
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
    expect(eventBus.handlers['notification']).toBeUndefined();
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
    expect(AppEventBus.handlers.navigate).toBeUndefined();
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
