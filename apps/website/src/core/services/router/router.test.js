import { AppRouter, Navigation, I18nService } from '#root/dist/src/core/services/index.js';
import { CONFIG } from '#root/dist/src/core/config.js';

function makeView(name) {
  const calls = [];
  const el = document.createElement('div');
  return {
    viewName: name,
    calls,
    getElement: () => el,
    setRouteParams: (params) => calls.push(['setRouteParams', params]),
    render: () => { calls.push(['render']); return el; },
    onEnter: () => calls.push(['onEnter']),
    onExit: () => calls.push(['onExit']),
    destroy: () => calls.push(['destroy']),
  };
}

describe('Router', () => {
  let router = null;

  beforeEach(() => {
    CONFIG.i18n = false;
    window.history.pushState({}, '', '/');
  });

  afterEach(() => {
    if (router) {
      router.dispose();
      router = null;
    }
    CONFIG.i18n = false;
    window.history.pushState({}, '', '/');
  });

  it('should be defined', () => {
    expect(AppRouter).toBeDefined();
  });

  it('AppRouter returns the same singleton instance on repeated getInstance() calls', async () => {
    const home = makeView('home');
    router = AppRouter({ '/': () => home });
    await flushPromises();

    const again = router.constructor.getInstance();
    expect(again).toBe(router);
  });

  it('navigate() matches a route and renders its view (via the initial construction-time navigate)', async () => {
    const home = makeView('home');
    router = AppRouter({ '/': () => home });
    await flushPromises();

    expect(home.calls).toEqual([
      ['setRouteParams', {}],
      ['render'],
      ['onEnter'],
    ]);
  });

  it('navigate() passes matched route params to the rendered view', async () => {
    const home = makeView('home');
    const userView = makeView('user');
    router = AppRouter({ '/': () => home, '/users/:id': () => userView });
    await flushPromises();

    await router.navigate('/users/42');

    expect(userView.calls[0]).toEqual(['setRouteParams', { id: '42' }]);
    expect(router.getCurrentParams()).toEqual({ id: '42' });
    expect(router.getParam('id')).toBe('42');
  });

  it('navigate() renders the /404 route when no pattern matches', async () => {
    const home = makeView('home');
    const notFound = makeView('not-found');
    router = AppRouter({ '/': () => home, '/404': () => notFound });
    await flushPromises();

    await router.navigate('/nope');

    expect(notFound.calls.some(c => c[0] === 'render')).toBe(true);
  });

  it('navigate() logs an error and renders nothing when no route matches and there is no /404 route', async () => {
    const home = makeView('home');
    router = AppRouter({ '/': () => home });
    await flushPromises();

    const errSpy = spyOn(console, 'error');
    errSpy.andCallFake(() => {});

    await router.navigate('/nope');

    expect(errSpy.callCount).toBe(1);
    errSpy.restore();
  });

  it('navigate() blocks navigation when a guard returns false', async () => {
    const home = makeView('home');
    const secret = makeView('secret');
    router = AppRouter({
      '/': () => home,
      '/secret': { view: () => secret, guards: [() => false] },
    });
    await flushPromises();

    await router.navigate('/secret');

    expect(secret.calls.length).toBe(0);
  });

  it('navigate() redirects when a guard returns a redirect path', async () => {
    const home = makeView('home');
    const login = makeView('login');
    const secret = makeView('secret');
    router = AppRouter({
      '/': () => home,
      '/login': () => login,
      '/secret': { view: () => secret, guards: [() => '/login'] },
    });
    await flushPromises();

    await router.navigate('/secret');

    expect(login.calls.some(c => c[0] === 'render')).toBe(true);
    expect(secret.calls.length).toBe(0);
  });

  it('navigate() renders the view when all guards pass', async () => {
    const home = makeView('home');
    const dashboard = makeView('dashboard');
    router = AppRouter({
      '/': () => home,
      '/dashboard': { view: () => dashboard, guards: [() => true] },
    });
    await flushPromises();

    await router.navigate('/dashboard');

    expect(dashboard.calls.some(c => c[0] === 'render')).toBe(true);
  });

  it('reload() re-navigates to the current path without pushing a new history entry', async () => {
    const home = makeView('home');
    router = AppRouter({ '/': () => home });
    await flushPromises();
    home.calls.length = 0;

    await router.reload();

    expect(home.calls.some(c => c[0] === 'render')).toBe(true);
  });

  it('responds to a popstate event by re-navigating to the new current path', async () => {
    const home = makeView('home');
    const about = makeView('about');
    router = AppRouter({ '/': () => home, '/about': () => about });
    await flushPromises();

    window.history.pushState({}, '', '/about');
    window.dispatchEvent(new window.PopStateEvent('popstate'));
    await flushPromises();

    expect(about.calls.some(c => c[0] === 'render')).toBe(true);
  });

  it('switches the language on popstate when the URL locale differs from the current one', async () => {
    CONFIG.i18n = true;
    I18nService['_LANGUAGES'] = ['en', 'fr'];
    I18nService['_currentLanguage'] = 'en';

    const home = makeView('home');
    router = AppRouter({ '/': () => home });
    await flushPromises();

    const setLangSpy = spyOn(I18nService, 'setCurrentLanguage');
    setLangSpy.andCallFake(async (lang) => { I18nService['_currentLanguage'] = lang; });

    window.history.pushState({}, '', '/fr');
    window.dispatchEvent(new window.PopStateEvent('popstate'));
    await flushPromises();

    expect(setLangSpy).toHaveBeenCalledWith('fr');

    setLangSpy.restore();
    I18nService['_currentLanguage'] = 'en';
  });

  it('wires Navigation.navigateTo() through to router.navigate()', async () => {
    const home = makeView('home');
    const about = makeView('about');
    router = AppRouter({ '/': () => home, '/about': () => about });
    await flushPromises();

    Navigation.navigateTo('/about');
    await flushPromises();

    expect(about.calls.some(c => c[0] === 'render')).toBe(true);
  });

  it('wires Navigation.reload() through to router.reload()', async () => {
    const home = makeView('home');
    router = AppRouter({ '/': () => home });
    await flushPromises();
    home.calls.length = 0;

    Navigation.reload();
    await flushPromises();

    expect(home.calls.some(c => c[0] === 'render')).toBe(true);
  });

  it('removeEventListeners() stops the router from responding to further navigate/popstate events', async () => {
    const home = makeView('home');
    const about = makeView('about');
    router = AppRouter({ '/': () => home, '/about': () => about });
    await flushPromises();

    router.removeEventListeners();

    Navigation.navigateTo('/about');
    await flushPromises();
    expect(about.calls.length).toBe(0);

    window.history.pushState({}, '', '/about');
    window.dispatchEvent(new window.PopStateEvent('popstate'));
    await flushPromises();
    expect(about.calls.length).toBe(0);
  });
});
