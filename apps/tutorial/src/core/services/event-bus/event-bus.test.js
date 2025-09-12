import { EventBus } from '#root/dist/src/core/services/index.js'

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
});
