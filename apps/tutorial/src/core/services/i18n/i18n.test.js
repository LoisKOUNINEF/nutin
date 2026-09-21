import { I18nService, AppEventBus } from '#root/dist/src/core/services/index.js';
import { CONFIG } from '#root/dist/src/core/config.js';

class FetchMock {
  constructor() {
    this.originalFetch = global.fetch;
    this.mockResponses = new Map();
  }
  
  mockTranslation(lang, data) {
    this.mockResponses.set(`/locales/${lang}.json`, {
      ok: true,
      status: 200,
      json: () => Promise.resolve(data)
    });
    return this;
  }

  mockError(url, status = 404) {
    this.mockResponses.set(url, {
      ok: false,
      status,
      json: () => Promise.reject(new Error(`HTTP ${status}`))
    });
    return this;
  }
  
  install() {
    global.fetch = (url) => {      
      if (this.mockResponses.has(url)) {
        const response = this.mockResponses.get(url);
        return Promise.resolve(response);
      }

      return this.originalFetch ? this.originalFetch(url) : Promise.reject(new Error('fetch not available'));
    };
    return this;
  }
  
  restore() {
    global.fetch = this.originalFetch;
    this.mockResponses.clear();
  }
}

const fetchMock = new FetchMock();

describe('i18n module', async () => {
  let originalLanguage;

  beforeEach(async () => {
    I18nService.resetTranslations();
    fetchMock
      .mockTranslation('en', { home: { title : 'My App', subtitle: "English subtitle" }})
      .mockTranslation('fr', { home: { title : 'Mon App' }})
      .install();
  });
  afterEach(() => {
    fetchMock.restore();
    localStorage.removeItem(I18nService.localStorageKey)
  });

  beforeAll(() =>{
    originalLanguage = navigator.language;    
    Object.defineProperty(navigator, 'language', {
      writable: true,
      configurable: true,
      value: "en-US"
    });
    I18nService['_LANGUAGES'] = [ 'en', 'fr' ];
    I18nService['_DEFAULT_LANGUAGE'] = 'en';
  });
  afterAll(() => {    
    Object.defineProperty(navigator, 'language', {
      writable: true,
      configurable: true,
      value: originalLanguage
    });
  });

  it('should load and use English translations', async () => {
    await I18nService.initTranslations();
    expect(I18nService.currentLanguage).toBe('en');
    expect(I18nService.translate('home.title')).toBe('My App');
  });

  it('should load and use French translations', async () => {
    Object.defineProperty(navigator, 'language', {
      writable: true,
      configurable: true,
      value: "fr-FR"
    });
    await I18nService.initTranslations();
    expect(I18nService.currentLanguage).toBe('fr');
    expect(I18nService.translate('home.title')).toBe('Mon App');
  });

  it('should default to English translations', async () => {
    // missing locale
    Object.defineProperty(navigator, 'language', {
      writable: true,
      configurable: true,
      value: "de-DE"
    });
    await I18nService.initTranslations();
    expect(navigator.language).toBe('de-DE');
    expect(I18nService.currentLanguage).toBe('en');
    expect(I18nService.translate('home.title')).toBe('My App');
    I18nService.resetTranslations();

    // missing translation
    Object.defineProperty(navigator, 'language', {
      writable: true,
      configurable: true,
      value: "fr-FR"
    });
    await I18nService.initTranslations();
    expect(navigator.language).toBe('fr-FR');
    expect(I18nService.currentLanguage).toBe('fr');
    expect(I18nService.translate('home.title')).toBe('Mon App');
    expect(I18nService.translate('home.subtitle')).toBe('English subtitle');
  });

  it('should return key when translation is missing', () => {
    expect(I18nService.translate('non.existent.key')).toBe('non.existent.key');
  });

  it('setCurrentLanguage updates the language, persists it and loads its translations', async () => {
    await I18nService.setCurrentLanguage('fr');

    expect(I18nService.currentLanguage).toBe('fr');
    expect(I18nService.translate('home.title')).toBe('Mon App');
    expect(localStorage.getItem(I18nService.localStorageKey)).toBe('fr');
  });

  it('setCurrentLanguage emits a language-changed event with the new language', async () => {
    const received = [];
    const callback = (data) => received.push(data);
    I18nService.onLanguageChange(callback);

    await I18nService.setCurrentLanguage('fr');

    expect(received).toEqual([{ lang: 'fr' }]);
    AppEventBus.off('language-changed', callback);
  });

  it('getTranslationObject returns the nested value for the current language', async () => {
    Object.defineProperty(navigator, 'language', { writable: true, configurable: true, value: 'en-US' });
    await I18nService.initTranslations();
    expect(I18nService.getTranslationObject('home')).toEqual({ title: 'My App', subtitle: 'English subtitle' });
  });

  it('getTranslationObject falls back to the default language when missing in the current language', async () => {
    Object.defineProperty(navigator, 'language', { writable: true, configurable: true, value: 'fr-FR' });
    await I18nService.initTranslations();
    expect(I18nService.getTranslationObject('home.subtitle')).toBe('English subtitle');
  });

  it('getTranslationObject returns null when the key is not found anywhere', async () => {
    Object.defineProperty(navigator, 'language', { writable: true, configurable: true, value: 'en-US' });
    await I18nService.initTranslations();
    expect(I18nService.getTranslationObject('does.not.exist')).toBe(null);
  });

  it('honors a locale prefix in the URL path when CONFIG.i18n is enabled', async () => {
    CONFIG.i18n = true;
    window.history.pushState({}, '', '/fr/some/page');
    try {
      await I18nService.initTranslations();
      expect(I18nService.currentLanguage).toBe('fr');
    } finally {
      CONFIG.i18n = false;
      window.history.pushState({}, '', '/');
    }
  });

  it('ignores a locale prefix in the URL path when CONFIG.i18n is disabled (default)', async () => {
    Object.defineProperty(navigator, 'language', { writable: true, configurable: true, value: 'en-US' });
    window.history.pushState({}, '', '/fr/some/page');
    try {
      await I18nService.initTranslations();
      expect(I18nService.currentLanguage).toBe('en');
    } finally {
      window.history.pushState({}, '', '/');
    }
  });

  it('initTranslations falls back to the default language when the resolved preferred language is unsupported', async () => {
    const original = I18nService.getPreferredLanguage;
    I18nService.getPreferredLanguage = () => 'zz';
    try {
      await I18nService.initTranslations();
      expect(I18nService.currentLanguage).toBe('en');
    } finally {
      I18nService.getPreferredLanguage = original;
    }
  });

  it('getLocaleFromUrl returns null when the URL locale segment is not supported', () => {
    CONFIG.i18n = true;
    window.history.pushState({}, '', '/xx/page');
    try {
      expect(I18nService.getLocaleFromUrl()).toBe(null);
    } finally {
      CONFIG.i18n = false;
      window.history.pushState({}, '', '/');
    }
  });

  it('loadDefaultTranslations logs and leaves default translations empty when the fetch fails', async () => {
    Object.defineProperty(navigator, 'language', { writable: true, configurable: true, value: 'fr-FR' });
    const errSpy = spyOn(console, 'error');
    errSpy.andCallFake(() => {});
    fetchMock.mockError('/locales/en.json', 500);

    await I18nService.initTranslations();

    // loadDefaultTranslations is attempted twice: once explicitly by initTranslations,
    // and again from within loadTranslations('fr') since _defaultTranslations is still
    // empty after the first failure — each attempt logs its own error.
    expect(errSpy.callCount).toBe(2);
    expect(I18nService.currentLanguage).toBe('fr');

    errSpy.restore();
  });

  it('honors a previously saved language preference from localStorage', async () => {
    localStorage.setItem(I18nService.localStorageKey, 'fr');
    await I18nService.initTranslations();
    expect(I18nService.currentLanguage).toBe('fr');
  });

  it('loadTranslations logs and leaves the language unchanged when the fetch rejects', async () => {
    Object.defineProperty(navigator, 'language', { writable: true, configurable: true, value: 'en-US' });
    const errSpy = spyOn(console, 'error');
    errSpy.andCallFake(() => {});
    global.fetch = () => Promise.reject(new Error('network down'));

    await I18nService.initTranslations();

    expect(errSpy.callCount).toBe(1);
    expect(I18nService.currentLanguage).toBe('en');

    errSpy.restore();
  });

  it('loadTranslations logs and leaves state unchanged when the response is not ok', async () => {
    Object.defineProperty(navigator, 'language', { writable: true, configurable: true, value: 'en-US' });
    const errSpy = spyOn(console, 'error');
    errSpy.andCallFake(() => {});
    fetchMock.mockError('/locales/en.json', 500);

    await I18nService.initTranslations();

    expect(errSpy.callCount).toBe(1);
    expect(I18nService.currentLanguage).toBe('en');

    errSpy.restore();
  });

  it('onDestroy resets translations and disposes the instance', async () => {
    await I18nService.initTranslations();
    expect(I18nService.translate('home.title')).toBe('My App');

    I18nService.onDestroy();

    expect(I18nService.translate('home.title')).toBe('home.title');
    expect(localStorage.getItem(I18nService.localStorageKey)).toBe(null);
  });
});
