import { I18nService, View } from "../../../index.js";

/**
 * Navigation - handles path normalization and history management
 */
export class NavigationManager {
  public static normalizePath(path: string): string {
    const url = new URL(path, window.location.origin);
    return (url.pathname || '/').replace(/\/+$/, '') || '/';
  }

  public static updateHistory(
    normalizedPath: string,
    currentPath: string,
    pushState: boolean
  ): void {
    if (this.shouldPushState(pushState, currentPath, normalizedPath)) {
      window.history.pushState({}, '', normalizedPath);
    }
  }

  public static updateMetaContent(currentView: View): void {
    if (!currentView.shouldUpdateMetaContent()) return;

    const strippedName = currentView.viewName.replace('-view', '');
    const title = `${strippedName}.meta.title`;
    const description = `${strippedName}.meta.description`;

    document.title = I18nService.translate(title);
    document.querySelector('meta[name="description"]')
      ?.setAttribute('content', I18nService.translate(description));
  }

  public static getCurrentPath(): string {
    return this.normalizePath(window.location.pathname);
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

  private static shouldPushState(
    pushState: boolean,
    currentPath: string,
    normalizedPath: string
  ): boolean {
    return pushState && currentPath !== normalizedPath;
  }
}
