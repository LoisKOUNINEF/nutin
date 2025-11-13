import { DEFAULT_LANGUAGE, LANGUAGES, Language, Translations } from './languages.js';
import { Service } from '../../index.js';

export class I18n extends Service<I18n> {
  protected readonly _DEFAULT_LANGUAGE: Language = DEFAULT_LANGUAGE;
  protected readonly _LANGUAGES = LANGUAGES;
  protected _currentLanguage: Language = this._DEFAULT_LANGUAGE;
  protected _translations: Translations = {};
  protected _defaultTranslations: Translations = {};

  constructor() {
    super();
    this.registerCleanup(this.resetTranslations);
  }

  private getBrowserLanguage() {
    return navigator.language.split('-')[0] as Language;
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

  protected onDestroy(): void | Promise<void> {
    this.resetTranslations();
    this.dispose();
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
    } catch (error) {
      console.error('Translation load error:', error);
    } 
  }

  public translate(key: string, params?: Record<string, string>): string {
    const keys = key.split('.');
    
    // Try to get value from current language translations
    let value = this.getNestedValue(this._translations, keys);
    
    // If not found, try fallback to default language
    if (!value && this._currentLanguage !== this._DEFAULT_LANGUAGE) {
      value = this.getNestedValue(this._defaultTranslations, keys);
    }
    
    // If still not found, return the key as fallback
    let result = value || key;
    
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        result = result.replace(`{${k}}`, v);
      });
    }
    
    return result;
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

  public async initTranslations(): Promise<void> {
    const browserLang = this.getBrowserLanguage();
    const lang = this._LANGUAGES.includes(browserLang) ? browserLang : this._DEFAULT_LANGUAGE;

    // Always load default translations first
    if (lang !== this._DEFAULT_LANGUAGE) {
      await this.loadDefaultTranslations();
    }

    await this.loadTranslations(lang);
  }

  public resetTranslations(): void {
    this._translations = {};
    this._defaultTranslations = {};
    this._currentLanguage = this._DEFAULT_LANGUAGE;
  }
}

export const I18nService = I18n.getInstance();
