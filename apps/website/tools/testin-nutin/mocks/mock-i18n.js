import { createMockMethod } from './create-mock-method.js';

// Mirrors I18n's public API with in-memory translations (seed them with
// setTranslations()/setDefaultTranslations()); no fetch, no localStorage.
export class MockI18n {
  constructor(defaultLang = 'en', supportedLangs = ['en']) {
    this._DEFAULT_LANGUAGE = defaultLang;
    this._LANGUAGES = supportedLangs;
    this._translations = {};
    this._defaultTranslations = {};
    this._currentLanguage = defaultLang;
    this._languageListeners = [];

    this.loadTranslations = createMockMethod(async (lang) => {
      this._currentLanguage = lang;
    });

    this.setCurrentLanguage = createMockMethod(async (lang) => {
      await this.loadTranslations(lang);
      this._languageListeners.forEach((callback) => callback({ lang }));
    });

    // Returns the unsubscribe function, like I18n.onLanguageChange.
    this.onLanguageChange = createMockMethod((callback) => {
      this._languageListeners.push(callback);
      return () => {
        this._languageListeners = this._languageListeners.filter((listener) => listener !== callback);
      };
    });

    // Same lookup as I18n.translate: nested dot keys, default-language fallback,
    // then the given textContent, then the key itself.
    this.translate = createMockMethod((key, textContent) => {
      return this._lookup(key) || textContent || key;
    });

    this.getTranslationObject = createMockMethod((key) => this._lookup(key) || null);

    this.initTranslations = createMockMethod(async () => {
      await this.loadTranslations(this._DEFAULT_LANGUAGE);
    });

    this.resetTranslations = createMockMethod(() => {
      this._translations = {};
      this._defaultTranslations = {};
      this._currentLanguage = this._DEFAULT_LANGUAGE;
    });

    this.onDestroy = createMockMethod(() => {
      this.resetTranslations();
    });
  }

  get currentLanguage() {
    return this._currentLanguage;
  }

  get defaultLanguage() {
    return this._DEFAULT_LANGUAGE;
  }

  get languages() {
    return this._LANGUAGES;
  }

  get localStorageKey() {
    return 'nutin-fav-lang';
  }

  _lookup(key) {
    const keys = key.split('.');
    const read = (obj) => keys.reduce((acc, k) => acc?.[k], obj);
    let value = read(this._translations);
    if (!value && this._currentLanguage !== this._DEFAULT_LANGUAGE) value = read(this._defaultTranslations);
    return value;
  }

  setTranslations(translations) {
    this._translations = translations;
  }

  setDefaultTranslations(translations) {
    this._defaultTranslations = translations;
  }

  reset() {
    this.loadTranslations.mockReset();
    this.setCurrentLanguage.mockReset();
    this.onLanguageChange.mockReset();
    this.translate.mockReset();
    this.getTranslationObject.mockReset();
    this.initTranslations.mockReset();
    this.resetTranslations.mockReset();
    this.onDestroy.mockReset();

    this._translations = {};
    this._defaultTranslations = {};
    this._currentLanguage = this._DEFAULT_LANGUAGE;
    this._languageListeners = [];
  }
}
