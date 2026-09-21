import { MockRouter } from './mock-router.js';

describe('MockRouter', () => {
  it('stores the routes passed to the constructor', () => {
    const routes = { '/home': {} };
    const router = new MockRouter(routes);

    expect(router.routes).toBe(routes);
  });

  it('navigate/handlePopState/handleNotFound/handleGuards/initializeEventListeners are independent bare mocks', () => {
    const router = new MockRouter();
    router.navigate('/about');

    expect(router.navigate.calls).toEqual([['/about']]);
    expect(router.handlePopState.calls).toEqual([]);
  });

  it('reset() clears every mock method and _currentView', () => {
    const router = new MockRouter();
    router.navigate('/about');
    router._currentView = 'about-view';

    router.reset();

    expect(router.navigate.calls).toEqual([]);
    expect(router._currentView).toBe(null);
  });
});
