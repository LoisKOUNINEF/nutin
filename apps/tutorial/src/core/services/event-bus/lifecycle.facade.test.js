import { Lifecycle, AppEventBus } from '#root/dist/src/core/index.js';

describe('LifecycleFacade (Lifecycle)', () => {
  afterEach(() => {
    AppEventBus.cleanupEventListeners();
  });

  it('beforeRender emits "before-render"', () => {
    const emit = spyOn(AppEventBus, 'emit');
    Lifecycle.beforeRender();
    expect(emit).toHaveBeenCalledWith('before-render');
    emit.restore();
  });

  it('onBeforeRender subscribes to "before-render", and the returned unsubscribe removes it', () => {
    let called = 0;
    const unsubscribe = Lifecycle.onBeforeRender(() => called++);

    Lifecycle.beforeRender();
    expect(called).toBe(1);

    unsubscribe();
    Lifecycle.beforeRender();
    expect(called).toBe(1);
  });

  it('afterRender emits "after-render"', () => {
    const emit = spyOn(AppEventBus, 'emit');
    Lifecycle.afterRender();
    expect(emit).toHaveBeenCalledWith('after-render');
    emit.restore();
  });

  it('onAfterRender subscribes to "after-render", and the returned unsubscribe removes it', () => {
    let called = 0;
    const unsubscribe = Lifecycle.onAfterRender(() => called++);

    Lifecycle.afterRender();
    expect(called).toBe(1);

    unsubscribe();
    Lifecycle.afterRender();
    expect(called).toBe(1);
  });

  it('beforeDestroy emits "before-destroy"', () => {
    const emit = spyOn(AppEventBus, 'emit');
    Lifecycle.beforeDestroy();
    expect(emit).toHaveBeenCalledWith('before-destroy');
    emit.restore();
  });

  it('onBeforeDestroy subscribes to "before-destroy", and the returned unsubscribe removes it', () => {
    let called = 0;
    const unsubscribe = Lifecycle.onBeforeDestroy(() => called++);

    Lifecycle.beforeDestroy();
    expect(called).toBe(1);

    unsubscribe();
    Lifecycle.beforeDestroy();
    expect(called).toBe(1);
  });

  it('afterDestroy emits "after-destroy"', () => {
    const emit = spyOn(AppEventBus, 'emit');
    Lifecycle.afterDestroy();
    expect(emit).toHaveBeenCalledWith('after-destroy');
    emit.restore();
  });

  it('onAfterDestroy subscribes to "after-destroy", and the returned unsubscribe removes it', () => {
    let called = 0;
    const unsubscribe = Lifecycle.onAfterDestroy(() => called++);

    Lifecycle.afterDestroy();
    expect(called).toBe(1);

    unsubscribe();
    Lifecycle.afterDestroy();
    expect(called).toBe(1);
  });

  it('viewMount emits "view-mount" with { viewName }', () => {
    const emit = spyOn(AppEventBus, 'emit');
    Lifecycle.viewMount('home');
    expect(emit).toHaveBeenCalledWith('view-mount', { viewName: 'home' });
    emit.restore();
  });

  it('onViewMount subscribes to "view-mount", and the returned unsubscribe removes it', () => {
    let received = null;
    const unsubscribe = Lifecycle.onViewMount((data) => { received = data; });

    Lifecycle.viewMount('home');
    expect(received).toEqual({ viewName: 'home' });

    unsubscribe();
    received = null;
    Lifecycle.viewMount('other');
    expect(received).toBe(null);
  });

  it('viewUnmount emits "view-unmount" with { viewName }', () => {
    const emit = spyOn(AppEventBus, 'emit');
    Lifecycle.viewUnmount('home');
    expect(emit).toHaveBeenCalledWith('view-unmount', { viewName: 'home' });
    emit.restore();
  });

  it('onViewUnmount subscribes to "view-unmount", and the returned unsubscribe removes it', () => {
    let received = null;
    const unsubscribe = Lifecycle.onViewUnmount((data) => { received = data; });

    Lifecycle.viewUnmount('home');
    expect(received).toEqual({ viewName: 'home' });

    unsubscribe();
    received = null;
    Lifecycle.viewUnmount('other');
    expect(received).toBe(null);
  });
});
