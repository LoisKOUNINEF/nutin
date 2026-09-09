import { NavigationManager } from '#root/dist/src/core/services/router/helpers/navigation-manager.helper.js';
import { I18nService } from '#root/dist/src/core/services/index.js';
import { CONFIG } from '#root/dist/src/core/config.js';

describe('NavigationManager', () => {
  it('should normalize paths by removing trailing slashes', () => {
    expect(NavigationManager.normalizePath('/about/')).toBe('/about');
    expect(NavigationManager.normalizePath('/about///')).toBe('/about');
    expect(NavigationManager.normalizePath('/')).toBe('/');
    expect(NavigationManager.normalizePath('')).toBe('/');
  });

  it('should call pushState when conditions are met', () => {
    const originalPushState = window.history.pushState;
    let called = false;

    window.history.pushState = function (state, title, url) {
      called = true;
      expect(url).toBe('/about');
    };

    NavigationManager.updateHistory('/about', '/home', true);
    expect(called).toBe(true);

    window.history.pushState = originalPushState;
  });

  it('should not call pushState if shouldPushState returns false', () => {
    const originalPushState = window.history.pushState;
    let called = false;

    window.history.pushState = function () {
      called = true;
    };

    NavigationManager.updateHistory('/about', '/home', false);

    expect(called).toBe(false);
    window.history.pushState = originalPushState;
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

  it('matchPattern returns null when the path does not match the pattern at all', () => {
    expect(NavigationManager.matchPattern('/posts/:id', '/other/123')).toBe(null);
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
    CONFIG.generateSEOFiles = true;
    CONFIG.seo = { routes: [{ path: '/', title: { en: 'Home', fr: 'Accueil' } }] };
    I18nService['_LANGUAGES'] = ['en', 'fr'];
    I18nService['_currentLanguage'] = 'fr';
    try {
      NavigationManager.updateDocumentTitle({ viewName: 'home' }, '/');
      expect(document.title).toBe('Accueil');
    } finally {
      CONFIG.generateSEOFiles = false;
      I18nService['_currentLanguage'] = 'en';
    }
  });

  it('updateDocumentTitle falls back to the default language, then any available language, then viewName', () => {
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
});
