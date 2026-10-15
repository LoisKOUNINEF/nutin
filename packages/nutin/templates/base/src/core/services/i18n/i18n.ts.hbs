import { DEFAULT_LANGUAGE, LANGUAGES } from './languages.js';
import { AppEventBus } from '../event-bus/event-bus.js';
import { Service } from '../../base-classes/service/service.js';
import { CONFIG } from '../../config.js';

export class I18n extends Service<I18n> {
  private readonly _DEFAULT_LANGUAGE: Nutin.Language = DEFAULT_LANGUAGE;
  private readonly _LANGUAGES = LANGUAGES;
  private _currentLanguage: Nutin.Language = this._DEFAULT_LANGUAGE;
  private _translations: Nutin.Translations = {};
  private _defaultTranslations: Nutin.Translations = {};

  constructor() {
    super();
    this.registerCleanup(this.clearTranslations);
    this._currentLanguage = this.getPreferredLanguage();
  }

  public get currentLanguage(): Nutin.Language {
    return this._currentLanguage;
  }

  public get defaultLanguage(): Nutin.Language {
    return this._DEFAULT_LANGUAGE;
  }

  public get languages(): Nutin.Language[] {
    return this._LANGUAGES;
  }

  public async setCurrentLanguage(lang: Nutin.Language): Promise<void> {
    this._currentLanguage = lang;
    await this.loadTranslations(lang);
    AppEventBus.emit('language-changed', { lang });
  }

  // Returns the unsubscribe function, like Navigation.onNavigate().
  public onLanguageChange(callback: (payload: { lang: string }) => void): () => void {
    AppEventBus.subscribe('language-changed', callback);
    return () => AppEventBus.off('language-changed', callback);
  }

  public async loadTranslations(lang: Nutin.Language): Promise<void> {
    try {
      const response = await fetch(`/locales/${lang}.json`);
      
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      this._translations = await response.json();
      this._currentLanguage = lang;
      
      if (lang !== this._DEFAULT_LANGUAGE && Object.keys(this._defaultTranslations).length === 0) {
        await this.loadDefaultTranslations();
      }
      
      document.documentElement.lang = lang;
    } catch (error) {
      console.error('Translation load error:', error);
    }
  }

  public translate(key: string, textContent?: string | null): string {
    const keys = key.split('.');
    
    // Try to get value from current language translations
    let value = this.getNestedValue(this._translations, keys);
    
    // If not found, try fallback to default language
    if (!value && this._currentLanguage !== this._DEFAULT_LANGUAGE) {
      value = this.getNestedValue(this._defaultTranslations, keys);
    }
    
    return value || textContent || key;
  }

  public async initTranslations(): Promise<void> {
    const preferredLang = this.getPreferredLanguage();
    const lang = this._LANGUAGES.includes(preferredLang) ? preferredLang : this._DEFAULT_LANGUAGE;

    // Always load default translations first
    if (lang !== this._DEFAULT_LANGUAGE) {
      await this.loadDefaultTranslations();
    }

    await this.loadTranslations(lang);
  }

  public getTranslationObject<T = any>(key: string): T | null {
    const keys = key.split('.');
    
    let value = this.getNestedValue(this._translations, keys);

    if (!value && this._currentLanguage !== this._DEFAULT_LANGUAGE) {
      value = this.getNestedValue(this._defaultTranslations, keys);
    }
    
    return value || null;
  }

  // Also forgets the saved language preference.
  public resetTranslations(): void {
    this.clearTranslations();
  }

  // Teardown keeps the saved preference: it belongs to the user, not to this instance.
  protected onDestroy(): void | Promise<void> {
    this.dispose();
  }

  private clearTranslations(): void {
    this._translations = {};
    this._defaultTranslations = {};
    this._currentLanguage = this._DEFAULT_LANGUAGE;
  }

  private getPreferredLanguage(): Nutin.Language {
    const urlLocale = this.getLocaleFromUrl();
    if (urlLocale) return urlLocale;
    const browserLang = navigator.language.split('-')[0] as Nutin.Language;
    return this._LANGUAGES.includes(browserLang) ? browserLang : this._DEFAULT_LANGUAGE;
  }

  private getLocaleFromUrl(): Nutin.Language | null {
    if (!(globalThis.__NUTIN_I18N__ ?? CONFIG.i18n)) return null;

    const first = window.location.pathname.split('/').filter(Boolean)[0] as Nutin.Language;
    return first && this._LANGUAGES.includes(first) ? first : null;
  }

  private async loadDefaultTranslations(): Promise<void> {
    try {
      const response = await fetch(`/locales/${this._DEFAULT_LANGUAGE}.json`);
      
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      this._defaultTranslations = await response.json();
    } catch (error) {
      console.error('Default translation load error:', error);
    }
  }

  private getNestedValue(obj: any, keys: string[]): any {
    let value = obj;
    // Own keys only: "constructor" or "__proto__" must not resolve to Object.prototype members.
    for (const key of keys) {
      value = value !== null && typeof value === 'object' && Object.prototype.hasOwnProperty.call(value, key)
        ? value[key]
        : undefined;
      if (!value) break;
    }
    return value;
  }
}

export const I18nService = /* @__PURE__ */ I18n.getInstance();

/**
 * Loads the translations when i18n is enabled in nutin.config.js; a no-op otherwise.
 */
export async function initI18n(): Promise<void> {
  if (globalThis.__NUTIN_I18N__ ?? CONFIG.i18n) await I18nService.initTranslations();
}
