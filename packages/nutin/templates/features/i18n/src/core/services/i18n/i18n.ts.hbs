import { DEFAULT_LANGUAGE, LANGUAGES, Language, Translations } from './languages.js';
import { AppEventBus, Service } from '../../index.js';

export class I18n extends Service<I18n> {
  private readonly _DEFAULT_LANGUAGE: Language = DEFAULT_LANGUAGE;
  private readonly _LANGUAGES = LANGUAGES;
  private _currentLanguage: Language = this._DEFAULT_LANGUAGE;
  private _translations: Translations = {};
  private _defaultTranslations: Translations = {};
  private readonly _localStorageKey = 'nutin-fav-lang';

  constructor() {
    super();
    this.registerCleanup(this.resetTranslations);
    this._currentLanguage = this.getPreferredLanguage();
  }

  public get currentLanguage(): Language {
    return this._currentLanguage;
  }

  public get defaultLanguage(): Language {
    return this._DEFAULT_LANGUAGE;
  }

  public get languages(): Language[] {
    return this._LANGUAGES;
  }

  public get localStorageKey(): string {
    return this._localStorageKey;
  }

  public async setCurrentLanguage(lang: Language): Promise<void> {
    this._currentLanguage = lang;
    this.savePreferences();
    await this.loadTranslations(lang);
    AppEventBus.emit('language-changed');
  }

  public async loadTranslations(lang: Language): Promise<void> {
    try {
      const response = await fetch(`/locales/${lang}.json`);
      
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      this._translations = await response.json();
      this._currentLanguage = lang;
      
      if (lang !== this._DEFAULT_LANGUAGE && Object.keys(this._defaultTranslations).length === 0) {
        await this.loadDefaultTranslations();
      }
      
      document.documentElement.lang = lang;   
      this.savePreferences();
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

  public resetTranslations(): void {
    this._translations = {};
    this._defaultTranslations = {};
    this._currentLanguage = this._DEFAULT_LANGUAGE;
  }

  protected onDestroy(): void | Promise<void> {
    this.resetTranslations();
    this.dispose();
  }

  private getPreferredLanguage() {
    return this.getPreferences() || navigator.language.split('-')[0] as Language;
  };

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
    for (const key of keys) {
      value = value?.[key];
      if (!value) break;
    }
    return value;
  }

  private savePreferences(): void {
    localStorage.setItem(this._localStorageKey, this._currentLanguage);
  }

  private getPreferences(): string | null {
    return localStorage.getItem(this._localStorageKey);
  }
}

export const I18nService = I18n.getInstance();
