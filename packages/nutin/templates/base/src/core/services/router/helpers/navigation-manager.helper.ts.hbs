import type { View } from "../../../base-classes/view/view.js";
import { I18nService } from "../../i18n/i18n.js";
import { CONFIG } from "../../../config.js";

// How a navigation affects the history stack: add an entry, rewrite the current one,
// or leave it untouched (back/forward, reload).
export type HistoryMode = 'push' | 'replace' | 'none';

// Long enough for screen readers to notice the live region's content change.
const ANNOUNCE_DELAY = 100;

// See reloadOnce().
const RELOAD_KEY = 'nutin:failed-load';
const RELOAD_WINDOW = 10_000;

// How browsers reject an import() whose file is gone or unreachable (Chrome|Firefox|Safari).
const MODULE_LOAD_ERROR = /Failed to fetch dynamically imported module|error loading dynamically imported module|Importing a module script failed/;
// Where esbuild writes the app's own lazy chunks (tools/builder: chunks/).
const CHUNKS_PATH = '/chunks/';

/**
 * Navigation - handles path normalization and history management
 */
// I18nService must go unreferenced for prod builds to drop it when i18n is off.
export function extractLocale(path: string): { locale: Nutin.Language | null; strippedPath: string } {
  if (globalThis.__NUTIN_I18N__ ?? CONFIG.i18n) {
    const segments = path.split('/').filter(Boolean);
    const first = segments[0] as Nutin.Language;
    if (first && I18nService.languages.includes(first)) {
      const rest = segments.slice(1).join('/');
      return { locale: first, strippedPath: rest ? `/${rest}` : '/' };
    }
  }
  return { locale: null, strippedPath: path };
}

export function addLocalePrefix(strippedPath: string): string {
  if (globalThis.__NUTIN_I18N__ ?? CONFIG.i18n) {
    const lang = I18nService.currentLanguage;
    return strippedPath === '/' ? `/${lang}` : `/${lang}${strippedPath}`;
  }
  return strippedPath;
}

export function getCurrentLocale(): Nutin.Language | null {
  return extractLocale(window.location.pathname).locale;
}

export function updateLocaleInUrl(): void {
  const rawPathname = (new URL(window.location.pathname, window.location.origin).pathname || '/').replace(/\/+$/, '') || '/';
  const { strippedPath } = extractLocale(rawPathname);
  const newUrl = addLocalePrefix(strippedPath);
  if (newUrl !== window.location.pathname) {
    window.history.pushState({}, '', newUrl + window.location.search + window.location.hash);
  }
}

export function normalizePath(path: string): string {
  const collapsed = path.replace(/\/\/+/g, '/');
  const url = new URL(collapsed, window.location.origin);
  // Parsing can bring "//" back ("/./\\host" -> "//host"), which the browser reads as another host: collapse again.
  const pathname = (url.pathname || '/').replace(/\/\/+/g, '/').replace(/\/+$/, '') || '/';
  return extractLocale(pathname).strippedPath;
}

export function updateHistory(
  normalizedPath: string,
  mode: HistoryMode,
  hash?: string,
  search: string = ''
): void {
  if (mode === 'none') return;
  const localizedPath = localizedUrl(normalizedPath, search, hash);
  const currentUrl = window.location.pathname + window.location.search + window.location.hash;
  if (currentUrl === localizedPath) return;
  if (mode === 'push') {
    window.history.pushState({}, '', localizedPath);
  } else {
    window.history.replaceState({}, '', localizedPath);
  }
}

// The URL of a path as it appears in the address bar: locale prefix, query and hash.
export function localizedUrl(normalizedPath: string, search: string = '', hash?: string): string {
  return addLocalePrefix(normalizedPath) + search + (hash ? `#${hash}` : '');
}

// A lazy route's view failed to load: see reloadOnce().
export function recoverFromFailedViewLoad(url: string, error: unknown): void {
  reloadOnce(url, error, 'the view');
}

// Code failed to load: a full page load of `url` fetches the new build.
// The last reload is recorded in sessionStorage, so code that keeps failing (or a broken chunk)
// can't reload forever. The same URL again only logs, and the current page stays:
// - within RELOAD_WINDOW (a lazy route's view: a later deploy can recover it again).
// - however late with oncePerSession (an import() nothing caught: Safari names no module in its error,
//   so a third-party one can't be told apart, and may fail again on every click).
// Offline, or when sessionStorage throws or doesn't keep the record, it only logs:
// a reload would trade the page for an error page, or could repeat with nothing to stop it.
export function reloadOnce(url: string, error: unknown, what: string, oncePerSession = false): void {
  console.error(`[router] Failed to load ${what} for "${url}".`, error);
  if (navigator.onLine === false) return;
  try {
    const last = JSON.parse(sessionStorage.getItem(RELOAD_KEY) ?? 'null') as { url?: string; at: number } | null;
    const now = Date.now();
    if (last?.url === url && (oncePerSession || now - last.at < RELOAD_WINDOW)) return;
    const record = JSON.stringify({ url, at: now });
    sessionStorage.setItem(RELOAD_KEY, record);
    // Read back: storage that accepts a write without keeping it couldn't stop the next reload.
    if (sessionStorage.getItem(RELOAD_KEY) !== record) return;
  } catch {
    return;
  }
  loadPage(url);
}

// An import() of one of the app's own chunks that failed because its file couldn't be fetched,
// as opposed to an error thrown by the module's own code.
// A third-party module (an ad blocker, a CSP or a CDN outage) isn't the app's to recover by reloading:
// when the message names the module, it must be a same-origin chunk.
// Safari's message names none: assumed to be one.
export function isModuleLoadError(reason: unknown): boolean {
  if (!(reason instanceof TypeError) || !MODULE_LOAD_ERROR.test(reason.message)) return false;
  // Chrome and Firefox append the module's absolute URL to the message.
  const { message } = reason;
  return !message.includes('://') || message.includes(window.location.origin + CHUNKS_PATH);
}

// A full (non-SPA) page load.
export function loadPage(url: string): void {
  window.location.assign(url);
}

// Rewrites the current history entry's URL to match content already rendered without adding a
// new back/forward-navigable entry. The current query string and hash are kept.
export function replaceState(path: string): void {
  window.history.replaceState({}, '', localizedUrl(path, window.location.search, window.location.hash.slice(1)));
}

// Scrolls to the element matching `hash` (a bare fragment, no leading "#") if it exists.
// Falls back to the top of the page otherwise
// Matches the browser's own native fallback for an unresolvable fragment.
export function scrollToHash(hash?: string): void {
  const target = hash ? document.getElementById(hash) : null;
  if (target) {
    target.scrollIntoView({ block: 'start' });
  } else {
    window.scrollTo({ top: 0 });
  }
}

// Moves focus to the new view after an in-app navigation, so keyboard and screen-reader
// users land on it instead of on <body> (the link they used is gone): its <h1>, else the
// <h1> in <main>; without one, the view itself, with the page title announced instead.
// preventScroll keeps scrollToHash()'s position.
export function focusView(view: View): void {
  const viewElement = view.getElement();
  const heading = viewElement.querySelector('h1') ?? document.querySelector('main h1');
  if (heading instanceof HTMLElement) {
    focusElement(heading);
    return;
  }
  focusElement(viewElement);
  announce(document.title);
}

// An element made focusable only for this (a heading, the view) gets no focus ring: it isn't
// interactive, so the ring would only look like a stray highlight. Screen readers still read it
// and Tab still continues from it. Once it loses focus, it's restored as it was, so it never
// becomes a click/Tab target. An element with its own tabindex keeps its own styling.
function focusElement(element: HTMLElement): void {
  if (!element.hasAttribute('tabindex')) {
    const previousOutline = element.style.outline;
    element.setAttribute('tabindex', '-1');
    element.style.outline = 'none';
    element.addEventListener('blur', () => {
      element.removeAttribute('tabindex');
      element.style.outline = previousOutline;
      if (!element.getAttribute('style')) element.removeAttribute('style');
    }, { once: true });
  }
  element.focus({ preventScroll: true });
}

let announcer: HTMLElement | null = null;

// A visually hidden polite live region, created on first use. Emptied first and filled
// a moment later, so a title identical to the previous one is still announced.
function announce(message: string): void {
  if (!announcer?.isConnected) {
    const region = document.createElement('div');
    region.setAttribute('role', 'status');
    region.setAttribute('aria-live', 'polite');
    region.setAttribute('data-nutin-announcer', '');
    // Visually hidden. A new <div> has no padding or border, and clip-path covers every
    // browser the build supports (the legacy `clip` isn't needed); margin keeps it off the layout.
    region.style.cssText =
      'position:absolute;width:1px;height:1px;margin:-1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap';
    document.body.appendChild(region);
    announcer = region;
  }
  const region = announcer;
  region.textContent = '';
  setTimeout(() => { region.textContent = message; }, ANNOUNCE_DELAY);
}

// While the /404 view is shown, a robots noindex tag: the server answers every app URL with the
// SPA shell (HTTP 200), so without it a crawler would index the 404 page at the unknown URL.
// Only the router's own tag is ever removed: one the app put in index.html stays.
export function setNoIndex(on: boolean): void {
  const tag = document.head.querySelector('meta[data-nutin-noindex]');
  if (!on) {
    tag?.remove();
    return;
  }
  if (tag) return;
  const meta = document.createElement('meta');
  meta.setAttribute('name', 'robots');
  meta.setAttribute('content', 'noindex');
  meta.setAttribute('data-nutin-noindex', '');
  document.head.appendChild(meta);
}

export function getCurrentPath(): string {
  return normalizePath(window.location.pathname);
}

export function updateDocumentTitle(view: View, pattern: string): void {
  // Wrapped in the define like the i18n guards: prod bundles without generateSEOFiles drop the lookup.
  const route = (globalThis.__NUTIN_SEO__ ?? CONFIG.generateSEOFiles)
    ? CONFIG.seo?.routes?.find((r) => r.path === pattern)
    : undefined;
  const seoTitle = route?.title ? resolveSeoTitle(route.title) : undefined;
  const localeTitle = (globalThis.__NUTIN_I18N__ ?? CONFIG.i18n) ? I18nService.getTranslationObject<string>(`${view.viewName}.title`) : null;
  document.title = view.documentTitle?.() || seoTitle || localeTitle || view.viewName;
}

function resolveSeoTitle(title: string | Record<string, string>): string | undefined {
  if (typeof title !== 'object') return title;
  if (globalThis.__NUTIN_I18N__ ?? CONFIG.i18n) {
    const lang = I18nService.currentLanguage;
    const defaultLang = I18nService.defaultLanguage;
    return title[lang] ?? title[defaultLang] ?? Object.values(title)[0];
  }
  return Object.values(title)[0];
}

export function matchPattern(pattern: string, path: string): Record<string, string> | null {
  const paramNames: string[] = [];

  // Splits on "/:param?" and ":param"; the static parts in between match literally.
  const regexPattern = pattern
    .split(/(\/:[^/?]+\?|:[^/]+)/)
    .map((part) => {
      const optional = part.match(/^\/:([^/?]+)\?$/);
      if (optional) {
        paramNames.push(optional[1]!);
        return `(?:/([^/]+))?`; // whole "/param" is optional
      }
      const required = part.match(/^:([^/]+)$/);
      if (required) {
        paramNames.push(required[1]!);
        return `([^/]+)`;
      }
      return part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    })
    .join('');

  const regex = new RegExp(`^${regexPattern}$`);
  const match = path.match(regex);

  if (!match) return null;

  const params: Record<string, string> = {};
  paramNames.forEach((name, i) => {
    const value = match[i + 1];
    if (value) {
      params[name] = decodeParam(value);
    }
  });
  return params;
}

// The path comes percent-encoded from the URL; a malformed escape is kept as-is.
function decodeParam(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}
