import { Navigation, AppEventBus } from '#root/dist/src/core/index.js';

describe('NavigationFacade (Navigation)', () => {
  afterEach(() => {
    AppEventBus.cleanupEventListeners();
  });

  it('navigateTo emits "navigate" with { path }', () => {
    const emit = spyOn(AppEventBus, 'emit');
    Navigation.navigateTo('/about');
    expect(emit).toHaveBeenCalledWith('navigate', { path: '/about' });
    emit.restore();
  });

  it('onNavigate subscribes to "navigate", and the returned unsubscribe removes it', () => {
    let received = null;
    const unsubscribe = Navigation.onNavigate((data) => { received = data; });

    Navigation.navigateTo('/about');
    expect(received).toEqual({ path: '/about' });

    unsubscribe();
    received = null;
    Navigation.navigateTo('/contact');
    expect(received).toBe(null);
  });

  it('reload emits "reload"', () => {
    const emit = spyOn(AppEventBus, 'emit');
    Navigation.reload();
    expect(emit).toHaveBeenCalledWith('reload');
    emit.restore();
  });

  it('onReload subscribes to "reload", and the returned unsubscribe removes it', () => {
    let called = 0;
    const unsubscribe = Navigation.onReload(() => called++);

    Navigation.reload();
    expect(called).toBe(1);

    unsubscribe();
    Navigation.reload();
    expect(called).toBe(1);
  });
});
