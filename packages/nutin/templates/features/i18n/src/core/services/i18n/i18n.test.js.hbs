import { I18nService } from '#root/dist/src/core/services/index.js';

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
});
