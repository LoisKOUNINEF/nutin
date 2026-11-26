import * as NavigationManager from '#root/dist/src/core/services/router/helpers/navigation-manager.helper.js';
import { I18nService } from '#root/dist/src/core/services/index.js';
import { CONFIG } from '#root/dist/src/core/config.js';

// The announcer's delay, run on fake timers.
const ANNOUNCE_DELAY = 100;

// A view element inside a <main>, both in the document.
function mountView(html) {
  const main = document.createElement('main');
  const element = document.createElement('div');
  element.innerHTML = html;
  main.appendChild(element);
  document.body.appendChild(main);
  return { view: { viewName: 'probe', getElement: () => element }, main, element };
}

function cleanupFocusView() {
  document.querySelectorAll('main, [data-nutin-announcer]').forEach((el) => el.remove());
}

describe('NavigationManager', () => {
  afterEach(() => {
    useRealTimers();
    cleanupFocusView();
  });

  it('should normalize paths by removing trailing slashes', () => {
    expect(NavigationManager.normalizePath('/about/')).toBe('/about');
    expect(NavigationManager.normalizePath('/about///')).toBe('/about');
    expect(NavigationManager.normalizePath('/')).toBe('/');
    expect(NavigationManager.normalizePath('')).toBe('/');
  });

  it('never returns a path that starts with "//" (another host)', () => {
    expect(NavigationManager.normalizePath('/./\\evil.example')).toBe('/evil.example');
    expect(NavigationManager.normalizePath('/a/..\\/evil.example')).toBe('/evil.example');
    expect(NavigationManager.normalizePath('/%2e/\\evil.example/x')).toBe('/evil.example/x');
  });

  it('should call pushState when conditions are met', () => {
    const originalPushState = window.history.pushState;
    let called = false;

    window.history.pushState = function (state, title, url) {
      called = true;
      expect(url).toBe('/about');
    };

    NavigationManager.updateHistory('/about', 'push');
    expect(called).toBe(true);

    window.history.pushState = originalPushState;
  });

  it("should not touch history in 'none' mode", () => {
    const originalPushState = window.history.pushState;
    let called = false;

    window.history.pushState = function () {
      called = true;
    };

    NavigationManager.updateHistory('/about', 'none');

    expect(called).toBe(false);
    window.history.pushState = originalPushState;
  });

  it("updateHistory in 'replace' mode rewrites the current entry instead of pushing", () => {
    const originalReplaceState = window.history.replaceState;
    const originalPushState = window.history.pushState;
    let pushCalled = false;
    let replacedUrl = null;

    window.history.pushState = function () {
      pushCalled = true;
    };
    window.history.replaceState = function (state, title, url) {
      replacedUrl = url;
    };

    NavigationManager.updateHistory('/about', 'replace', 'team');

    window.history.pushState = originalPushState;
    window.history.replaceState = originalReplaceState;
    expect(pushCalled).toBe(false);
    expect(replacedUrl).toBe('/about#team');
  });

  it('replaceState calls history.replaceState (not pushState) with the locale-prefixed path', () => {
    const originalReplaceState = window.history.replaceState;
    const originalPushState = window.history.pushState;
    let pushCalled = false;
    let replaceArgs = null;

    window.history.pushState = () => { pushCalled = true; };
    window.history.replaceState = (state, title, url) => { replaceArgs = url; };

    try {
      NavigationManager.replaceState('/section/first-page');
      expect(replaceArgs).toBe('/section/first-page');
      expect(pushCalled).toBe(false);
    } finally {
      window.history.replaceState = originalReplaceState;
      window.history.pushState = originalPushState;
    }
  });

  it('replaceState preserves an existing hash fragment', () => {
    const originalReplaceState = window.history.replaceState;
    window.history.pushState({}, '', '/section#some-heading');
    let replaceArgs = null;
    window.history.replaceState = (state, title, url) => { replaceArgs = url; };

    try {
      NavigationManager.replaceState('/section/first-page');
      expect(replaceArgs).toBe('/section/first-page#some-heading');
    } finally {
      window.history.replaceState = originalReplaceState;
      window.history.pushState({}, '', '/');
    }
  });

  it('replaceState preserves the query string', () => {
    const originalReplaceState = window.history.replaceState;
    window.history.pushState({}, '', '/section?tab=api#some-heading');
    let replaceArgs = null;
    window.history.replaceState = (state, title, url) => { replaceArgs = url; };

    try {
      NavigationManager.replaceState('/section/first-page');
      expect(replaceArgs).toBe('/section/first-page?tab=api#some-heading');
    } finally {
      window.history.replaceState = originalReplaceState;
      window.history.pushState({}, '', '/');
    }
  });

  it('should return current path from location', () => {
    // This test assumes a DOM-like environment
    const currentPath = window.location.pathname;
    expect(NavigationManager.getCurrentPath()).toBe(currentPath);
  });

  it('extractLocale returns the original path untouched when CONFIG.i18n is disabled', () => {
    CONFIG.i18n = false;
    expect(NavigationManager.extractLocale('/fr/about')).toEqual({ locale: null, strippedPath: '/fr/about' });
  });

  it('extractLocale strips a recognized locale prefix when CONFIG.i18n is enabled', () => {
    CONFIG.i18n = true;
    I18nService['_LANGUAGES'] = ['en', 'fr'];
    try {
      expect(NavigationManager.extractLocale('/fr/about')).toEqual({ locale: 'fr', strippedPath: '/about' });
      expect(NavigationManager.extractLocale('/fr')).toEqual({ locale: 'fr', strippedPath: '/' });
    } finally {
      CONFIG.i18n = false;
    }
  });

  it('extractLocale leaves the path untouched when the first segment is not a recognized locale', () => {
    CONFIG.i18n = true;
    I18nService['_LANGUAGES'] = ['en', 'fr'];
    try {
      expect(NavigationManager.extractLocale('/about')).toEqual({ locale: null, strippedPath: '/about' });
    } finally {
      CONFIG.i18n = false;
    }
  });

  it('addLocalePrefix returns the path unchanged when CONFIG.i18n is disabled', () => {
    CONFIG.i18n = false;
    expect(NavigationManager.addLocalePrefix('/about')).toBe('/about');
  });

  it('addLocalePrefix prefixes the path with the current language when CONFIG.i18n is enabled', () => {
    CONFIG.i18n = true;
    I18nService['_LANGUAGES'] = ['en', 'fr'];
    I18nService['_currentLanguage'] = 'fr';
    try {
      expect(NavigationManager.addLocalePrefix('/about')).toBe('/fr/about');
      expect(NavigationManager.addLocalePrefix('/')).toBe('/fr');
    } finally {
      CONFIG.i18n = false;
      I18nService['_currentLanguage'] = 'en';
    }
  });

  it('getCurrentLocale reads the locale from the current URL path when CONFIG.i18n is enabled', () => {
    CONFIG.i18n = true;
    I18nService['_LANGUAGES'] = ['en', 'fr'];
    window.history.pushState({}, '', '/fr/about');
    try {
      expect(NavigationManager.getCurrentLocale()).toBe('fr');
    } finally {
      CONFIG.i18n = false;
      window.history.pushState({}, '', '/');
    }
  });

  it('getCurrentLocale returns null when CONFIG.i18n is disabled', () => {
    window.history.pushState({}, '', '/fr/about');
    try {
      expect(NavigationManager.getCurrentLocale()).toBe(null);
    } finally {
      window.history.pushState({}, '', '/');
    }
  });

  it('updateLocaleInUrl pushes a new URL when the locale-prefixed path differs from the current one', () => {
    CONFIG.i18n = true;
    I18nService['_LANGUAGES'] = ['en', 'fr'];
    I18nService['_currentLanguage'] = 'fr';
    window.history.pushState({}, '', '/about');

    const originalPushState = window.history.pushState;
    const calls = [];
    window.history.pushState = (...args) => {
      calls.push(args);
      originalPushState.apply(window.history, args);
    };

    try {
      NavigationManager.updateLocaleInUrl();
      expect(calls.length).toBe(1);
      expect(calls[0][2]).toBe('/fr/about');
    } finally {
      window.history.pushState = originalPushState;
      CONFIG.i18n = false;
      I18nService['_currentLanguage'] = 'en';
      window.history.pushState({}, '', '/');
    }
  });

  it('updateLocaleInUrl handles a root pathname that collapses to an empty string when stripped', () => {
    CONFIG.i18n = false;
    window.history.pushState({}, '', '/');

    const originalPushState = window.history.pushState;
    window.history.pushState = () => {};

    try {
      expect(() => NavigationManager.updateLocaleInUrl()).not.toThrow();
    } finally {
      window.history.pushState = originalPushState;
    }
  });

  it('updateLocaleInUrl does nothing when the URL already has the correct locale prefix', () => {
    CONFIG.i18n = true;
    I18nService['_LANGUAGES'] = ['en', 'fr'];
    I18nService['_currentLanguage'] = 'fr';
    window.history.pushState({}, '', '/fr/about');

    const originalPushState = window.history.pushState;
    let called = false;
    window.history.pushState = () => { called = true; };

    try {
      NavigationManager.updateLocaleInUrl();
      expect(called).toBe(false);
    } finally {
      window.history.pushState = originalPushState;
      CONFIG.i18n = false;
      I18nService['_currentLanguage'] = 'en';
      window.history.pushState({}, '', '/');
    }
  });

  it('matchPattern matches a required param', () => {
    expect(NavigationManager.matchPattern('/posts/:id', '/posts/123')).toEqual({ id: '123' });
  });

  it('matchPattern does not match when a required param segment is missing', () => {
    expect(NavigationManager.matchPattern('/posts/:id', '/posts')).toBe(null);
  });

  it('matchPattern matches an optional param when present, and omits it when absent', () => {
    expect(NavigationManager.matchPattern('/users/:id?', '/users/123')).toEqual({ id: '123' });
    expect(NavigationManager.matchPattern('/users/:id?', '/users')).toEqual({});
  });

  it('matchPattern matches multiple params in the same pattern', () => {
    expect(NavigationManager.matchPattern('/posts/:postId/comments/:commentId', '/posts/1/comments/2'))
      .toEqual({ postId: '1', commentId: '2' });
  });

  it('matchPattern decodes params and keeps a malformed escape as-is', () => {
    expect(NavigationManager.matchPattern('/users/:name', '/users/J%C3%B6rg')).toEqual({ name: 'Jörg' });
    expect(NavigationManager.matchPattern('/users/:name', '/users/100%')).toEqual({ name: '100%' });
  });

  it('matchPattern matches static segments literally', () => {
    expect(NavigationManager.matchPattern('/files/report.pdf', '/files/report.pdf')).toEqual({});
    expect(NavigationManager.matchPattern('/files/report.pdf', '/files/reportXpdf')).toBe(null);
    expect(NavigationManager.matchPattern('/v1.0/:id', '/v1.0/7')).toEqual({ id: '7' });
  });

  it('updateHistory keeps the query string', () => {
    const originalPushState = window.history.pushState;
    let pushedUrl = null;
    window.history.pushState = function (state, title, url) {
      pushedUrl = url;
    };

    NavigationManager.updateHistory('/list', 'push', 'top', '?page=2');

    window.history.pushState = originalPushState;
    expect(pushedUrl).toBe('/list?page=2#top');
  });

  it('matchPattern returns null when the path does not match the pattern at all', () => {
    expect(NavigationManager.matchPattern('/posts/:id', '/other/123')).toBe(null);
  });

  it('updateDocumentTitle prefers the view\'s own documentTitle() over seo.json and viewName', () => {
    CONFIG.generateSEOFiles = true;
    CONFIG.seo = { routes: [{ path: '/docs/:slug?', title: 'Docs' }] };
    try {
      NavigationManager.updateDocumentTitle({ viewName: 'docs', documentTitle: () => 'How do I navigate?' }, '/docs/:slug?');
      expect(document.title).toBe('How do I navigate?');
      NavigationManager.updateDocumentTitle({ viewName: 'docs', documentTitle: () => undefined }, '/docs/:slug?');
      expect(document.title).toBe('Docs');
    } finally {
      CONFIG.generateSEOFiles = false;
    }
  });

  it('updateDocumentTitle falls back to the view\'s viewName when generateSEOFiles is disabled', () => {
    CONFIG.generateSEOFiles = false;
    CONFIG.seo = { routes: [{ path: '/', title: 'Should not be used' }] };
    try {
      NavigationManager.updateDocumentTitle({ viewName: 'home' }, '/');
      expect(document.title).toBe('home');
    } finally {
      CONFIG.generateSEOFiles = false;
    }
  });

  it('updateDocumentTitle falls back to the view\'s viewName when no seo.json route matches the pattern', () => {
    CONFIG.generateSEOFiles = true;
    CONFIG.seo = { routes: [{ path: '/other', title: 'Other' }] };
    try {
      NavigationManager.updateDocumentTitle({ viewName: 'home' }, '/');
      expect(document.title).toBe('home');
    } finally {
      CONFIG.generateSEOFiles = false;
    }
  });

  it('updateDocumentTitle uses a flat seo.json title when generateSEOFiles is enabled and the pattern matches', () => {
    CONFIG.generateSEOFiles = true;
    CONFIG.seo = { routes: [{ path: '/', title: 'My App — Home' }] };
    try {
      NavigationManager.updateDocumentTitle({ viewName: 'home' }, '/');
      expect(document.title).toBe('My App — Home');
    } finally {
      CONFIG.generateSEOFiles = false;
    }
  });

  it('updateDocumentTitle resolves a per-language seo.json title to the current language', () => {
    CONFIG.i18n = true;
    CONFIG.generateSEOFiles = true;
    CONFIG.seo = { routes: [{ path: '/', title: { en: 'Home', fr: 'Accueil' } }] };
    I18nService['_LANGUAGES'] = ['en', 'fr'];
    I18nService['_currentLanguage'] = 'fr';
    try {
      NavigationManager.updateDocumentTitle({ viewName: 'home' }, '/');
      expect(document.title).toBe('Accueil');
    } finally {
      CONFIG.i18n = false;
      CONFIG.generateSEOFiles = false;
      I18nService['_currentLanguage'] = 'en';
    }
  });

  it('updateDocumentTitle uses the first value of a per-language seo.json title when i18n is disabled', () => {
    CONFIG.generateSEOFiles = true;
    CONFIG.seo = { routes: [{ path: '/', title: { fr: 'Accueil', en: 'Home' } }] };
    I18nService['_currentLanguage'] = 'en';
    try {
      NavigationManager.updateDocumentTitle({ viewName: 'home' }, '/');
      expect(document.title).toBe('Accueil');
    } finally {
      CONFIG.generateSEOFiles = false;
    }
  });

  it('updateDocumentTitle falls back to the default language, then any available language, then viewName', () => {
    CONFIG.i18n = true;
    CONFIG.generateSEOFiles = true;
    I18nService['_LANGUAGES'] = ['en', 'fr'];

    CONFIG.seo = { routes: [{ path: '/', title: { fr: 'Accueil' } }] };
    I18nService['_currentLanguage'] = 'en';
    try {
      // current lang ('en') missing -> falls back to default lang's value, present here as 'fr' only,
      // so it falls further to the first available value
      NavigationManager.updateDocumentTitle({ viewName: 'home' }, '/');
      expect(document.title).toBe('Accueil');

      CONFIG.seo = { routes: [{ path: '/', title: {} }] };
      NavigationManager.updateDocumentTitle({ viewName: 'home' }, '/');
      expect(document.title).toBe('home');
    } finally {
      CONFIG.i18n = false;
      CONFIG.generateSEOFiles = false;
      I18nService['_currentLanguage'] = 'en';
    }
  });

  it('updateDocumentTitle uses the view\'s locale title when i18n is enabled and no seo.json route matches', () => {
    CONFIG.i18n = true;
    CONFIG.generateSEOFiles = false;
    I18nService['_translations'] = { home: { title: 'Accueil' } };
    try {
      NavigationManager.updateDocumentTitle({ viewName: 'home' }, '/');
      expect(document.title).toBe('Accueil');
    } finally {
      CONFIG.i18n = false;
      I18nService['_translations'] = {};
    }
  });

  it('updateDocumentTitle prefers seo.json title over the locale title when both are present', () => {
    CONFIG.i18n = true;
    CONFIG.generateSEOFiles = true;
    CONFIG.seo = { routes: [{ path: '/', title: 'From seo.json' }] };
    I18nService['_translations'] = { home: { title: 'From locale' } };
    try {
      NavigationManager.updateDocumentTitle({ viewName: 'home' }, '/');
      expect(document.title).toBe('From seo.json');
    } finally {
      CONFIG.i18n = false;
      CONFIG.generateSEOFiles = false;
      I18nService['_translations'] = {};
    }
  });

  it('updateDocumentTitle ignores the locale title when i18n is disabled, falling back to viewName', () => {
    CONFIG.i18n = false;
    CONFIG.generateSEOFiles = false;
    I18nService['_translations'] = { home: { title: 'Should not be used' } };
    try {
      NavigationManager.updateDocumentTitle({ viewName: 'home' }, '/');
      expect(document.title).toBe('home');
    } finally {
      I18nService['_translations'] = {};
    }
  });

  it('focuses the view\'s h1, made focusable with tabindex="-1"', () => {
    const { view, element } = mountView('<p>intro</p><h1>Title</h1>');
    NavigationManager.focusView(view);
    const h1 = element.querySelector('h1');
    expect(document.activeElement).toBe(h1);
    expect(h1.getAttribute('tabindex')).toBe('-1');
  });

  it('keeps an h1\'s own tabindex and styling', () => {
    const { view, element } = mountView('<h1 tabindex="0">Title</h1>');
    const h1 = element.querySelector('h1');
    NavigationManager.focusView(view);
    expect(h1.getAttribute('tabindex')).toBe('0');
    expect(h1.style.outline).toBe('');
    expect(document.activeElement).toBe(h1);
  });

  it('hides the focus ring of an element it made focusable, and restores it on blur', () => {
    const { view, element } = mountView('<h1 style="color: red">Title</h1>');
    const h1 = element.querySelector('h1');
    NavigationManager.focusView(view);
    // jsdom 31 expands the shorthand (outline reads "medium", outlineStyle "none"); jsdom 30 doesn't.
    expect(h1.style.outlineStyle || h1.style.outline).toBe('none');

    h1.blur();
    expect(h1.hasAttribute('tabindex')).toBe(false);
    expect(h1.style.outline).toBe('');
    expect(h1.getAttribute('style')).toBe('color: red;');
  });

  it('leaves no style attribute behind on an element that had none', () => {
    const { view, element } = mountView('<h1>Title</h1>');
    const h1 = element.querySelector('h1');
    NavigationManager.focusView(view);
    h1.blur();
    expect(h1.hasAttribute('style')).toBe(false);
  });

  it('falls back to the h1 in <main> when the view has none', () => {
    const { view, main } = mountView('<p>no heading</p>');
    const h1 = document.createElement('h1');
    h1.textContent = 'Layout title';
    main.prepend(h1);
    NavigationManager.focusView(view);
    expect(document.activeElement).toBe(h1);
  });

  it('focuses the view itself and announces document.title when there is no h1', () => {
    useFakeTimers();
    const { view, element } = mountView('<p>no heading</p>');
    document.title = 'Probe page';
    NavigationManager.focusView(view);
    expect(document.activeElement).toBe(element);
    expect(element.getAttribute('tabindex')).toBe('-1');

    const region = document.querySelector('[data-nutin-announcer]');
    expect(region.getAttribute('role')).toBe('status');
    expect(region.getAttribute('aria-live')).toBe('polite');
    // Visually hidden (jsdom drops clip-path: Chrome checks it).
    expect(region.style.position).toBe('absolute');
    expect(region.style.width).toBe('1px');
    expect(region.style.height).toBe('1px');
    expect(region.style.overflow).toBe('hidden');
    expect(region.style.whiteSpace).toBe('nowrap');
    advanceTimersByTime(ANNOUNCE_DELAY - 1);
    expect(region.textContent).toBe('');
    advanceTimersByTime(1);
    expect(region.textContent).toBe('Probe page');
  });

  it('reuses one announcer, emptying it first so the same title is announced again', () => {
    useFakeTimers();
    const { view } = mountView('<p>no heading</p>');
    document.title = 'Same';
    NavigationManager.focusView(view);
    advanceTimersByTime(ANNOUNCE_DELAY);
    NavigationManager.focusView(view);
    const regions = document.querySelectorAll('[data-nutin-announcer]');
    expect(regions.length).toBe(1);
    expect(regions[0].textContent).toBe('');
    advanceTimersByTime(ANNOUNCE_DELAY);
    expect(regions[0].textContent).toBe('Same');
  });
  it('isModuleLoadError recognizes each browser\'s failed import() of the app\'s own chunks and nothing else', () => {
    const origin = window.location.origin;
    expect(NavigationManager.isModuleLoadError(new TypeError(`Failed to fetch dynamically imported module: ${origin}/chunks/x-AB12.js`))).toBe(true);
    expect(NavigationManager.isModuleLoadError(new TypeError(`error loading dynamically imported module: ${origin}/chunks/x-AB12.js.`))).toBe(true);
    // Safari doesn't name the module: assumed to be one of the app's chunks.
    expect(NavigationManager.isModuleLoadError(new TypeError('Importing a module script failed.'))).toBe(true);
    // A third-party module (ad blocker, CSP, CDN outage), or a same-origin file outside chunks/: not the app's to reload.
    expect(NavigationManager.isModuleLoadError(new TypeError('Failed to fetch dynamically imported module: https://cdn.example.com/widget.js'))).toBe(false);
    expect(NavigationManager.isModuleLoadError(new TypeError('Failed to fetch dynamically imported module: https://cdn.example.com/chunks/x.js'))).toBe(false);
    expect(NavigationManager.isModuleLoadError(new TypeError(`Failed to fetch dynamically imported module: ${origin}/vendor/x.js`))).toBe(false);
    expect(NavigationManager.isModuleLoadError(new TypeError('x is not a function'))).toBe(false);
    expect(NavigationManager.isModuleLoadError(new Error('Failed to fetch dynamically imported module'))).toBe(false);
    expect(NavigationManager.isModuleLoadError('Importing a module script failed.')).toBe(false);
    expect(NavigationManager.isModuleLoadError(undefined)).toBe(false);
  });

  it('reloadOnce reloads a URL once within its window, and never offline', async () => {
    // The full page load (location.assign) is a no-op in jsdom: the sessionStorage record written
    // right before it shows it was attempted.
    sessionStorage.clear();
    const record = () => JSON.parse(sessionStorage.getItem('nutin:failed-load') ?? 'null');
    try {
      await silenceConsole('error', async () => {
        Object.defineProperty(navigator, 'onLine', { configurable: true, value: false });
        NavigationManager.reloadOnce('/a', new Error('x'), 'a module');
        expect(record()).toBe(null);
        delete navigator.onLine;

        NavigationManager.reloadOnce('/a', new Error('x'), 'a module');
        const first = record();
        expect(first.url).toBe('/a');

        NavigationManager.reloadOnce('/a', new Error('x'), 'a module');
        expect(record().at).toBe(first.at);

        NavigationManager.reloadOnce('/b', new Error('x'), 'a module');
        expect(record().url).toBe('/b');
      });
    } finally {
      delete navigator.onLine;
      sessionStorage.clear();
    }
  });

  it('reloadOnce with oncePerSession doesn\'t reload the same URL again, however late', async () => {
    sessionStorage.clear();
    const record = () => JSON.parse(sessionStorage.getItem('nutin:failed-load') ?? 'null');
    let time = 0;
    const now = spyOn(Date, 'now').andCallFake(() => time);
    try {
      await silenceConsole('error', async () => {
        NavigationManager.reloadOnce('/a', new Error('x'), 'a module', true);
        expect(record()).toEqual({ url: '/a', at: 0 });

        // Well past the lazy-route window: still no second reload of the same URL.
        time = 60_000;
        NavigationManager.reloadOnce('/a', new Error('x'), 'a module', true);
        expect(record()).toEqual({ url: '/a', at: 0 });

        NavigationManager.reloadOnce('/b', new Error('x'), 'a module', true);
        expect(record()).toEqual({ url: '/b', at: 60_000 });
      });
    } finally {
      now.restore();
      sessionStorage.clear();
    }
  });

  it('reloadOnce never reloads when sessionStorage throws or doesn\'t keep its record', () => {
    // jsdom reports the full page load (location.assign to another URL) as a "Not implemented:
    // navigation" console error: counting those counts the reloads.
    const errors = spyOn(console, 'error').andCallFake(() => {});
    const reloads = () => errors.calls.filter((args) => String(args[0]).includes('Not implemented: navigation')).length;
    const storage = Object.getPrototypeOf(sessionStorage);
    sessionStorage.clear();
    let setItem;
    try {
      NavigationManager.reloadOnce('/reloads', new Error('x'), 'the view');
      expect(reloads()).toBe(1);

      setItem = spyOn(storage, 'setItem').andCallFake(() => {});
      NavigationManager.reloadOnce('/dropped', new Error('x'), 'the view');
      NavigationManager.reloadOnce('/dropped-module', new Error('x'), 'a module', true);
      setItem.andCallFake(() => { throw new Error('QuotaExceededError'); });
      NavigationManager.reloadOnce('/throws', new Error('x'), 'the view');
      NavigationManager.reloadOnce('/throws-module', new Error('x'), 'a module', true);

      expect(reloads()).toBe(1);
    } finally {
      setItem?.restore();
      errors.restore();
      sessionStorage.clear();
    }
  });

  it('setNoIndex adds one robots noindex tag, and removes only its own', () => {
    const own = () => document.head.querySelectorAll('meta[data-nutin-noindex]');
    const authorTag = document.createElement('meta');
    authorTag.setAttribute('name', 'robots');
    authorTag.setAttribute('content', 'noarchive');
    document.head.appendChild(authorTag);
    try {
      NavigationManager.setNoIndex(true);
      NavigationManager.setNoIndex(true);

      expect(own().length).toBe(1);
      expect(own()[0].getAttribute('name')).toBe('robots');
      expect(own()[0].getAttribute('content')).toBe('noindex');

      NavigationManager.setNoIndex(false);

      expect(own().length).toBe(0);
      expect(authorTag.isConnected).toBe(true);
    } finally {
      authorTag.remove();
      NavigationManager.setNoIndex(false);
    }
  });
});
