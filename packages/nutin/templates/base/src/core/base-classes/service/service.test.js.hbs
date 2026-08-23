import { Service } from '#root/dist/src/core/base-classes/service/service.js';

class TestService extends Service {
  constructor() {
    super();
    this.destroyCalls = 0;
    this.cleanupCalls = [];
  }

  addCleanup(fn) {
    this.registerCleanup(fn);
  }

  onDestroy() {
    this.destroyCalls++;
  }

  ping() {
    return this;
  }
}

class OtherTestService extends Service {
  constructor() {
    super();
    this.destroyCalls = 0;
  }

  onDestroy() {
    this.destroyCalls++;
  }
}

describe('Service', () => {
  afterEach(() => {
    TestService.testingResetAll();
    OtherTestService.testingResetAll();
  });

  it('throws when instantiated directly instead of via getInstance', () => {
    expect(() => new TestService()).toThrow('TestService is a Service. Use TestService.getInstance() instead.');
  });

  it('creates the instance lazily on first getInstance call', () => {
    expect(Service.hasInstance(TestService)).toBe(false);
    const instance = TestService.getInstance();
    expect(instance).toBeInstanceOf(TestService);
    expect(Service.hasInstance(TestService)).toBe(true);
  });

  it('returns the same instance on repeated getInstance calls without args', () => {
    const instance1 = TestService.getInstance();
    const instance2 = TestService.getInstance();
    expect(instance1).toBe(instance2);
  });

  it('throws if getInstance is called with args on an already-initialized instance', () => {
    TestService.getInstance();
    expect(() => TestService.getInstance('arg')).toThrow('already initialized');
  });

  it('does not throw when getInstance is called with args for a fresh instance', () => {
    expect(() => TestService.getInstance()).not.toThrow();
  });

  it('hasInstance reflects whether an instance has been created', () => {
    expect(Service.hasInstance(TestService)).toBe(false);
    TestService.getInstance();
    expect(Service.hasInstance(TestService)).toBe(true);
  });

  it('registerCleanup callbacks run on dispose and are cleared afterward', () => {
    const instance = TestService.getInstance();
    let cleaned = false;
    instance.addCleanup(() => { cleaned = true; });

    instance.dispose();

    expect(cleaned).toBe(true);
    expect(Service.hasInstance(TestService)).toBe(false);
  });

  it('dispose clears cleanup callbacks so they only run once', () => {
    const instance = TestService.getInstance();
    let calls = 0;
    instance.addCleanup(() => { calls++; });

    instance.dispose();
    instance.dispose();

    expect(calls).toBe(1);
  });

  it('destroy calls onDestroy and removes the instance from the registry', async () => {
    const instance = TestService.getInstance();
    await TestService.destroy();

    expect(instance.destroyCalls).toBe(1);
    expect(Service.hasInstance(TestService)).toBe(false);
  });

  it('destroy is a no-op when no instance exists', async () => {
    expect(Service.hasInstance(TestService)).toBe(false);
    await TestService.destroy();
    expect(Service.hasInstance(TestService)).toBe(false);
  });

  it('destroyAll calls onDestroy on every instance and clears the registry', async () => {
    const a = TestService.getInstance();
    const b = OtherTestService.getInstance();

    await Service.destroyAll();

    expect(a.destroyCalls).toBe(1);
    expect(b.destroyCalls).toBe(1);
    expect(Service.hasInstance(TestService)).toBe(false);
    expect(Service.hasInstance(OtherTestService)).toBe(false);
  });

  it('autoBindMethods binds subclass methods so they work detached from the instance', () => {
    const instance = TestService.getInstance();
    const { ping } = instance;
    expect(ping()).toBe(instance);
  });

  it('testingReset removes only the targeted instance without running cleanup', () => {
    const instance1 = TestService.getInstance();
    let cleaned = false;
    instance1.addCleanup(() => { cleaned = true; });

    TestService.testingReset();

    expect(cleaned).toBe(false);
    const instance2 = TestService.getInstance();
    expect(instance1).not.toBe(instance2);
  });

  it('testingResetAll clears every instance without running cleanup', () => {
    const a = TestService.getInstance();
    OtherTestService.getInstance();
    let cleaned = false;
    a.addCleanup(() => { cleaned = true; });

    Service.testingResetAll();

    expect(cleaned).toBe(false);
    expect(Service.hasInstance(TestService)).toBe(false);
    expect(Service.hasInstance(OtherTestService)).toBe(false);
  });
});
