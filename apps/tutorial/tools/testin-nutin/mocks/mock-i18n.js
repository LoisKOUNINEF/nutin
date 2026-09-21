import { createMockMethod } from './create-mock-method.js';

export class MockI18n {
  constructor(defaultLang = 'en', supportedLangs = ['en']) {
    this._DEFAULT_LANGUAGE = defaultLang;
    this._LANGUAGES = supportedLangs;
    this._translations = {};
    this._defaultTranslations = {};
    this._currentLanguage = defaultLang;

    this.loadTranslations = createMockMethod(async (lang) => {
      this._currentLanguage = lang;
    });

    this.translate = createMockMethod((key, params) => {
      const value = this._translations[key] || this._defaultTranslations[key] || key;
      if (!params) return value;
      return Object.entries(params).reduce(
        (acc, [k, v]) => acc.replace(`{${k}}`, v),
        value
      );
    });

    this.initTranslations = createMockMethod(async () => {
      const lang = this._LANGUAGES.includes('browser') ? 'browser' : this._DEFAULT_LANGUAGE;
      await this.loadTranslations(lang);
    });

    this.resetTranslations = createMockMethod(() => {
      this._translations = {};
      this._defaultTranslations = {};
      this._currentLanguage = this._DEFAULT_LANGUAGE;
    });

    this.getBrowserLanguage = createMockMethod(() => 'en');

    this.loadDefaultTranslations = createMockMethod(async () => {
      this._defaultTranslations = { 'fallback.key': 'Fallback Value' };
    });

    this.getNestedValue = createMockMethod((obj, keys) => {
      return keys.reduce((acc, key) => acc?.[key], obj);
    });

    this.onDestroy = createMockMethod(() => {
      this.resetTranslations();
    });
  }

  get currentLanguage() {
    return this._currentLanguage;
  }

  setTranslations(translations) {
    this._translations = translations;
  }

  setDefaultTranslations(translations) {
    this._defaultTranslations = translations;
  }

  reset() {
    this.loadTranslations.mockReset();
    this.translate.mockReset();
    this.initTranslations.mockReset();
    this.resetTranslations.mockReset();
    this.getBrowserLanguage.mockReset();
    this.loadDefaultTranslations.mockReset();
    this.getNestedValue.mockReset();
    this.onDestroy.mockReset();

    this._translations = {};
    this._defaultTranslations = {};
    this._currentLanguage = this._DEFAULT_LANGUAGE;
  }
}
