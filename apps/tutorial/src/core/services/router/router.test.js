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

// Records pushState/replaceState URLs while still applying them to the real history.
function trackHistory() {
  const originalPush = window.history.pushState;
  const originalReplace = window.history.replaceState;
  const tracked = { pushed: [], replaced: [] };
  window.history.pushState = function (state, title, url) {
    tracked.pushed.push(url);
    return originalPush.call(this, state, title, url);
  };
  window.history.replaceState = function (state, title, url) {
    tracked.replaced.push(url);
    return originalReplace.call(this, state, title, url);
  };
  tracked.restore = () => {
    window.history.pushState = originalPush;
    window.history.replaceState = originalReplace;
  };
  return tracked;
}

describe('Router', () => {
  let router = null;

  beforeEach(() => {
    CONFIG.i18n = false;
    CONFIG.generateSEOFiles = false;
    window.history.pushState({}, '', '/');
  });

  afterEach(() => {
    if (router) {
      router.dispose();
      router = null;
    }
    CONFIG.i18n = false;
    CONFIG.generateSEOFiles = false;
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

  it('navigate() applies a view\'s onEnter() history rewrite without it being overwritten by the router\'s own history update', async () => {
    const home = makeView('home');
    const section = makeView('section');
    section.onEnter = () => {
      section.calls.push(['onEnter']);
      window.history.replaceState({}, '', '/section/first-page');
    };
    router = AppRouter({ '/': () => home, '/section': () => section });
    await flushPromises();

    await router.navigate('/section');

    expect(window.location.pathname).toBe('/section/first-page');
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

  it('navigate() keeps the query string and decodes route params', async () => {
    const home = makeView('home');
    const userView = makeView('user');
    router = AppRouter({ '/': () => home, '/users/:name': () => userView });
    await flushPromises();

    await router.navigate('/users/J%C3%B6rg?tab=posts#top');

    expect(router.getParam('name')).toBe('Jörg');
    expect(window.location.pathname + window.location.search + window.location.hash).toBe('/users/J%C3%B6rg?tab=posts#top');
  });

  it('reload() keeps the current query string', async () => {
    const home = makeView('home');
    const list = makeView('list');
    router = AppRouter({ '/': () => home, '/list': () => list });
    await flushPromises();
    await router.navigate('/list?page=2');

    await router.reload();

    expect(window.location.search).toBe('?page=2');
  });

  it('drops a navigation whose guard resolves after a newer navigation started', async () => {
    const home = makeView('home');
    const slow = makeView('slow');
    const fast = makeView('fast');
    let releaseGuard;
    router = AppRouter({
      '/': () => home,
      '/slow': { view: () => slow, guards: [() => new Promise((resolve) => { releaseGuard = resolve; })] },
      '/fast': () => fast,
    });
    await flushPromises();

    const slowNav = router.navigate('/slow');
    await router.navigate('/fast');
    releaseGuard(true);
    await slowNav;

    expect(slow.calls.length).toBe(0);
    expect(fast.calls.some(c => c[0] === 'render')).toBe(true);
    expect(window.location.pathname).toBe('/fast');
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

  it('navigate() pushes the redirect target when an in-app navigation is redirected by a guard', async () => {
    const home = makeView('home');
    const login = makeView('login');
    const secret = makeView('secret');
    router = AppRouter({
      '/': () => home,
      '/login': () => login,
      '/secret': { view: () => secret, guards: [() => '/login'] },
    });
    await flushPromises();
    const history = trackHistory();

    await router.navigate('/secret');
    history.restore();

    expect(history.pushed).toEqual(['/login']);
    expect(history.replaced).toEqual([]);
    expect(window.location.pathname).toBe('/login');
  });

  it('replaces the guarded URL with the redirect target on first load', async () => {
    const login = makeView('login');
    const secret = makeView('secret');
    window.history.pushState({}, '', '/secret');
    const history = trackHistory();

    router = AppRouter({
      '/login': () => login,
      '/secret': { view: () => secret, guards: [() => '/login'] },
    });
    await flushPromises();
    history.restore();

    expect(login.calls.some(c => c[0] === 'render')).toBe(true);
    expect(history.pushed).toEqual([]);
    expect(history.replaced).toEqual(['/login']);
    expect(window.location.pathname).toBe('/login');
  });

  it('replaces the guarded URL with the redirect target on popstate', async () => {
    const home = makeView('home');
    const login = makeView('login');
    const secret = makeView('secret');
    router = AppRouter({
      '/': () => home,
      '/login': () => login,
      '/secret': { view: () => secret, guards: [() => '/login'] },
    });
    await flushPromises();

    window.history.pushState({}, '', '/secret');
    const history = trackHistory();
    window.dispatchEvent(new window.PopStateEvent('popstate'));
    await flushPromises();
    history.restore();

    expect(login.calls.some(c => c[0] === 'render')).toBe(true);
    expect(secret.calls.length).toBe(0);
    expect(history.pushed).toEqual([]);
    expect(history.replaced).toEqual(['/login']);
    expect(window.location.pathname).toBe('/login');
  });

  it('reload() replaces the current URL when its guard now redirects', async () => {
    let loggedIn = true;
    const login = makeView('login');
    const account = makeView('account');
    window.history.pushState({}, '', '/account');
    router = AppRouter({
      '/login': () => login,
      '/account': { view: () => account, guards: [() => loggedIn || '/login'] },
    });
    await flushPromises();

    loggedIn = false;
    const history = trackHistory();
    await router.reload();
    history.restore();

    expect(login.calls.some(c => c[0] === 'render')).toBe(true);
    expect(history.pushed).toEqual([]);
    expect(history.replaced).toEqual(['/login']);
    expect(window.location.pathname).toBe('/login');
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

  it('sets document.title to the view\'s viewName when generateSEOFiles is disabled', async () => {
    CONFIG.generateSEOFiles = false;
    CONFIG.seo = { routes: [{ path: '/', title: 'Should not be used' }] };

    const home = makeView('home');
    router = AppRouter({ '/': () => home });
    await flushPromises();

    expect(document.title).toBe('home');
  });

  it('falls back to the view\'s viewName when generateSEOFiles is enabled but no seo.json route matches', async () => {
    CONFIG.generateSEOFiles = true;
    CONFIG.seo = { routes: [] };

    const home = makeView('home');
    router = AppRouter({ '/': () => home });
    await flushPromises();

    expect(document.title).toBe('home');
  });

  it('sets document.title from config/seo.json when generateSEOFiles is enabled and a route matches', async () => {
    CONFIG.generateSEOFiles = true;
    CONFIG.seo = { routes: [{ path: '/', title: 'My App — Home' }] };

    const home = makeView('home');
    router = AppRouter({ '/': () => home });
    await flushPromises();

    expect(document.title).toBe('My App — Home');
  });

  it('sets document.title for the /404 route', async () => {
    CONFIG.generateSEOFiles = true;
    CONFIG.seo = { routes: [{ path: '/404', title: 'Not Found' }] };

    const home = makeView('home');
    const notFound = makeView('not-found');
    router = AppRouter({ '/': () => home, '/404': () => notFound });
    await flushPromises();

    await router.navigate('/nope');

    expect(document.title).toBe('Not Found');
  });

  it('resolves a per-language title when i18n is enabled', async () => {
    CONFIG.i18n = true;
    CONFIG.generateSEOFiles = true;
    CONFIG.seo = { routes: [{ path: '/', title: { en: 'Home', fr: 'Accueil' } }] };
    I18nService['_LANGUAGES'] = ['en', 'fr'];
    I18nService['_currentLanguage'] = 'fr';

    const home = makeView('home');
    router = AppRouter({ '/': () => home });
    await flushPromises();

    expect(document.title).toBe('Accueil');

    I18nService['_currentLanguage'] = 'en';
  });

  it('falls back to the view\'s locale title when i18n is enabled and no seo.json route matches', async () => {
    CONFIG.i18n = true;
    I18nService['_translations'] = { home: { title: 'Accueil' } };

    const home = makeView('home');
    router = AppRouter({ '/': () => home });
    await flushPromises();

    expect(document.title).toBe('Accueil');

    I18nService['_translations'] = {};
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
