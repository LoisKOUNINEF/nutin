import { I18nService, View } from "../../../index.js";
import { Language } from "../../i18n/languages.js";
import { CONFIG } from "../../../config.js";

/**
 * Navigation - handles path normalization and history management
 */
export class NavigationManager {
  public static extractLocale(path: string): { locale: Language | null; strippedPath: string } {
    if (!CONFIG.i18n) return { locale: null, strippedPath: path };

    const segments = path.split('/').filter(Boolean);
    const first = segments[0] as Language;
    if (first && I18nService.languages.includes(first)) {
      const rest = segments.slice(1).join('/');
      return { locale: first, strippedPath: rest ? `/${rest}` : '/' };
    }
    return { locale: null, strippedPath: path };
  }

  public static addLocalePrefix(strippedPath: string): string {
    if (!CONFIG.i18n) return strippedPath;

    const lang = I18nService.currentLanguage;
    return strippedPath === '/' ? `/${lang}` : `/${lang}${strippedPath}`;
  }

  public static getCurrentLocale(): Language | null {
    return this.extractLocale(window.location.pathname).locale;
  }

  public static updateLocaleInUrl(): void {
    const rawPathname = (new URL(window.location.pathname, window.location.origin).pathname || '/').replace(/\/+$/, '') || '/';
    const { strippedPath } = this.extractLocale(rawPathname);
    const newUrl = this.addLocalePrefix(strippedPath);
    if (newUrl !== window.location.pathname) {
      window.history.pushState({}, '', newUrl);
    }
  }

  public static normalizePath(path: string): string {
    const collapsed = path.replace(/\/\/+/g, '/');
    const url = new URL(collapsed, window.location.origin);
    const pathname = (url.pathname || '/').replace(/\/+$/, '') || '/';
    return this.extractLocale(pathname).strippedPath;
  }

  public static updateHistory(
    normalizedPath: string,
    currentPath: string,
    pushState: boolean
  ): void {
    const localizedPath = this.addLocalePrefix(normalizedPath);
    if (pushState && window.location.pathname !== localizedPath) {
      window.history.pushState({}, '', localizedPath);
    }
  }

  public static getCurrentPath(): string {
    return this.normalizePath(window.location.pathname);
  }

  public static updateDocumentTitle(view: View, pattern: string): void {
    const route = CONFIG.generateSEOFiles
      ? CONFIG.seo?.routes?.find((r) => r.path === pattern)
      : undefined;
    const seoTitle = route?.title ? this.resolveSeoTitle(route.title) : undefined;
    const localeTitle = CONFIG.i18n ? I18nService.getTranslationObject<string>(`${view.viewName}.title`) : null;
    document.title = seoTitle || localeTitle || view.viewName;
  }

  private static resolveSeoTitle(title: string | Record<string, string>): string | undefined {
    if (typeof title !== 'object') return title;
    const lang = I18nService.currentLanguage;
    const defaultLang = I18nService.defaultLanguage;
    return title[lang] ?? title[defaultLang] ?? Object.values(title)[0];
  }

  public static matchPattern(pattern: string, path: string): Record<string, string> | null {
    const paramNames: string[] = [];

    const regexPattern = pattern
      .replace(/\/:([^/?]+)\?/g, (_, paramName) => {
        paramNames.push(paramName);
        return `(?:/([^/]+))?`; // whole "/param" is optional
      })
      .replace(/:([^/]+)/g, (_, paramName) => {
        paramNames.push(paramName);
        return `([^/]+)`;
      });

    const regex = new RegExp(`^${regexPattern}$`);
    const match = path.match(regex);

    if (!match) return null;

    const params: Record<string, string> = {};
    paramNames.forEach((name, i) => {
      const value = match[i + 1];
      if (value) {
        params[name] = value;
      }
    });
    return params;
  }
}
