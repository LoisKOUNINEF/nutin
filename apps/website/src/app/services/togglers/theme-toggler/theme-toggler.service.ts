import { Service } from '../../../../core/index.js';

export class ThemeToggler extends Service<ThemeToggler> {  
  private _isLightTheme: boolean;
  private readonly _lightTheme = 'light';
  private readonly _darkTheme = 'dark';
  private readonly _localStorageName = 'preferred-theme';

  constructor() {
    super();
    this._isLightTheme = this.lightTheme();
    this.initTheme();
  }

  public get isLightTheme(): boolean {
    return this._isLightTheme;
  }

  public toggleTheme(): void {
    this._isLightTheme = !this._isLightTheme;
    this.savePreferences();
    this.initTheme();
  }

  public initTheme() {
    const theme = this.getThemeFromStorage();
    document.body.classList.remove('light-theme', 'dark-theme', 'theme-transition');
    document.body.classList.add(`${theme}-theme`, 'theme-transition');
  }

  private lightTheme(): boolean {
    const theme = this.getThemeFromStorage();
    if (theme === this._lightTheme) return true;
    else return false;
  }
  
  private savePreferences() {
    let pref;
    if (this._isLightTheme) pref = this._lightTheme;
    else pref = this._darkTheme;
    localStorage.setItem(this._localStorageName, pref);
  }

  private getThemeFromStorage(): string {
    return localStorage.getItem(this._localStorageName) || this.getSystemPreference() || this._lightTheme;
  }

  private getSystemPreference(): string {
    return window.matchMedia('(prefers-color-scheme: dark)').matches
      ? this._darkTheme
      : this._lightTheme;
  }

}

export const ThemeTogglerService = ThemeToggler.getInstance();
