import type { View } from "../../../base-classes/view/view.js";
import { I18nService } from "../../i18n/i18n.js";
import { CONFIG } from "../../../config.js";

// How a navigation affects the history stack: add an entry, rewrite the current
// one (e.g. a guard redirecting away from the URL already in the address bar),
// or leave it untouched (back/forward, reload).
export type HistoryMode = 'push' | 'replace' | 'none';

// Long enough for screen readers to notice the live region's content change.
const ANNOUNCE_DELAY = 100;

// See recoverFromFailedViewLoad().
const RELOAD_KEY = 'nutin:failed-view-load';
const RELOAD_WINDOW = 10_000;

/**
 * Navigation - handles path normalization and history management
 */
// The i18n guards wrap their branch rather than returning early: esbuild only drops
// a constant-false block, not code after a constant early return, and I18nService
// must go unreferenced for prod builds to drop it when i18n is off.
export function extractLocale(path: string): { locale: Language | null; strippedPath: string } {
  if (globalThis.__NUTIN_I18N__ ?? CONFIG.i18n) {
    const segments = path.split('/').filter(Boolean);
    const first = segments[0] as Language;
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

export function getCurrentLocale(): Language | null {
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
  // Parsing can bring "//" back ("/./\\host" -> "//host"), which the browser reads as another
  // host (pushState throws, a full page load leaves the site): collapse again.
  const pathname = (url.pathname || '/').replace(/\/\/+/g, '/').replace(/\/+$/, '') || '/';
  return extractLocale(pathname).strippedPath;
}

export function updateHistory(
  normalizedPath: string,
  currentPath: string,
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

// A lazy route's view failed to load: usually a deploy replaced the chunks while this tab
// was open, or the network dropped. A full page load of the target URL fetches the new
// build. It happens once per URL within RELOAD_WINDOW (recorded in sessionStorage), so a
// view that keeps failing (or a broken chunk) can't reload forever: the error is logged
// and the current page stays. Without sessionStorage, it only logs.
export function recoverFromFailedViewLoad(url: string, error: unknown): void {
  console.error(`[router] Failed to load the view for "${url}".`, error);
  try {
    const last = JSON.parse(sessionStorage.getItem(RELOAD_KEY) ?? 'null') as { url?: string; at?: number } | null;
    const now = Date.now();
    if (last?.url === url && typeof last.at === 'number' && now - last.at < RELOAD_WINDOW) return;
    sessionStorage.setItem(RELOAD_KEY, JSON.stringify({ url, at: now }));
  } catch {
    return;
  }
  loadPage(url);
}

// A full (non-SPA) page load.
export function loadPage(url: string): void {
  window.location.assign(url);
}

// Rewrites the current history entry's URL to match content already rendered
// (e.g. a route that fell back to a default sub-page) without adding a
// new back/forward-navigable entry.
export function replaceState(path: string): void {
  const localizedPath = addLocalePrefix(path) + window.location.hash;
  window.history.replaceState({}, '', localizedPath);
}

// Scrolls to the element matching `hash` (a bare fragment, no leading "#") if it
// exists; falls back to the top of the page otherwise (no hash, or a stale/broken
// id) — matches the browser's own native fallback for an unresolvable fragment.
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
// a moment later, so a title identical to the previous one is still announced (a timer,
// not requestAnimationFrame: that one doesn't run in a background tab).
function announce(message: string): void {
  if (!announcer?.isConnected) {
    const region = document.createElement('div');
    region.setAttribute('role', 'status');
    region.setAttribute('aria-live', 'polite');
    region.setAttribute('data-nutin-announcer', '');
    region.style.cssText =
      'position:absolute;width:1px;height:1px;margin:-1px;padding:0;border:0;' +
      'overflow:hidden;clip:rect(0 0 0 0);clip-path:inset(50%);white-space:nowrap;';
    document.body.appendChild(region);
    announcer = region;
  }
  const region = announcer;
  region.textContent = '';
  setTimeout(() => { region.textContent = message; }, ANNOUNCE_DELAY);
}

export function getCurrentPath(): string {
  return normalizePath(window.location.pathname);
}

export function updateDocumentTitle(view: View, pattern: string): void {
  const route = CONFIG.generateSEOFiles
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
