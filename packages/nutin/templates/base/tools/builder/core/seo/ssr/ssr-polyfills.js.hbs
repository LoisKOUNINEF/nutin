import fs from 'fs';
import path from 'path';

/**
 * Installs the minimum browser globals the framework's own base classes touch
 * unconditionally (the Router's `popstate` listener, I18n's `navigator`/`window.location`
 * reads), plus a couple of cheap defensive stubs (matchMedia) for common patterns
 * downstream projects add (e.g. dark-mode toggles).
 *
 * Returns `trackedFetches`, the in-flight promises served by the fetch shim during this
 * render — ssr-render.js awaits these before capturing markup, to let any resulting
 * fetch-driven re-render (via `listenToRenderEvents`) complete first.
 */
function setGlobal(target, key, value) {
  try {
    Object.defineProperty(target, key, { value, writable: true, configurable: true, enumerable: true });
  } catch (err) {
    // Object.defineProperty throws a TypeError for a genuinely non-configurable
    // property — skip it and let whatever Node/linkedom already provides stand.
    // Anything else is unexpected and shouldn't be silently swallowed.
    if (!(err instanceof TypeError)) throw err;
  }
}

const KNOWN_DOM_GLOBALS = [
  'document', 'customElements',
  'Node', 'Element', 'HTMLElement', 'HTMLDocument',
  'HTMLInputElement', 'HTMLTextAreaElement', 'HTMLImageElement',
  'HTMLMediaElement', 'HTMLSourceElement', 'HTMLAnchorElement',
  'HTMLButtonElement', 'HTMLFormElement', 'HTMLSelectElement',
  'HTMLOptionElement', 'HTMLTemplateElement', 'HTMLStyleElement',
  'HTMLScriptElement', 'HTMLLinkElement', 'HTMLMetaElement',
  'HTMLTitleElement', 'HTMLHeadElement', 'HTMLBodyElement',
  'HTMLHtmlElement', 'HTMLLabelElement', 'HTMLSpanElement',
  'HTMLDivElement', 'HTMLUListElement', 'HTMLOListElement',
  'HTMLLIElement', 'HTMLTableElement', 'HTMLParagraphElement',
  'HTMLHeadingElement', 'HTMLIFrameElement',
  'SVGElement', 'Text', 'Comment', 'DocumentFragment', 'DocumentType',
  'Event', 'CustomEvent', 'MutationObserver', 'NodeFilter', 'NodeList',
  'DOMParser', 'XMLSerializer', 'Attr',
];

function createMemoryStorage() {
  const store = new Map();
  return {
    getItem: (key) => (store.has(key) ? store.get(key) : null),
    setItem: (key, value) => { store.set(key, String(value)); },
    removeItem: (key) => { store.delete(key); },
    clear: () => { store.clear(); },
    key: (index) => Array.from(store.keys())[index] ?? null,
    get length() { return store.size; },
  };
}

export function installGlobals(window, { lang, mockFetch = {}, localesDir, staticDir } = {}) {
  for (const key of Object.getOwnPropertyNames(window)) {
    setGlobal(globalThis, key, window[key]);
  }
  for (const key of KNOWN_DOM_GLOBALS) {
    if (typeof window[key] !== 'undefined') setGlobal(globalThis, key, window[key]);
  }
  setGlobal(globalThis, 'window', window);

  const navigatorStub = { language: lang, userAgent: 'nutin-ssr' };
  setGlobal(globalThis, 'navigator', navigatorStub);
  setGlobal(window, 'navigator', navigatorStub);

  // linkedom doesn't implement localStorage/sessionStorage at all
  // I18n's savePreferences()/getPreferences() need it.
  const localStorageStub = createMemoryStorage();
  setGlobal(globalThis, 'localStorage', localStorageStub);
  setGlobal(window, 'localStorage', localStorageStub);
  const sessionStorageStub = createMemoryStorage();
  setGlobal(globalThis, 'sessionStorage', sessionStorageStub);
  setGlobal(window, 'sessionStorage', sessionStorageStub);

  const matchMediaStub = (query) => ({
    matches: false,
    media: query,
    addEventListener() {},
    removeEventListener() {},
    addListener() {},
    removeListener() {},
    dispatchEvent: () => false,
  });
  setGlobal(globalThis, 'matchMedia', matchMediaStub);
  setGlobal(window, 'matchMedia', matchMediaStub);

  const trackedFetches = [];

  const fetchShim = (input) => {
    const url = typeof input === 'string' ? input : input?.url;
    const promise = resolveFetch(url, { mockFetch, localesDir, staticDir });
    trackedFetches.push(promise);
    return promise;
  };
  setGlobal(globalThis, 'fetch', fetchShim);
  setGlobal(window, 'fetch', fetchShim);

  return { trackedFetches };
}

export async function resolveFetch(url, { mockFetch = {}, localesDir, staticDir } = {}) {
  if (Object.prototype.hasOwnProperty.call(mockFetch, url)) {
    return jsonResponse(mockFetch[url]);
  }

  const localeMatch = /^\/locales\/([a-zA-Z-]+)\.json$/.exec(url ?? '');
  if (localeMatch) {
    const filePath = path.join(localesDir, `${localeMatch[1]}.json`);
    if (fs.existsSync(filePath)) {
      const body = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      return jsonResponse(body);
    }
    // No translations authored for this locale yet — a normal early-project state, not an error.
    return jsonResponse({});
  }

  const staticFile = resolveStaticFile(url, staticDir);
  if (staticFile) {
    const text = fs.readFileSync(staticFile, 'utf-8');
    return staticFile.endsWith('.json') ? jsonResponse(JSON.parse(text)) : textResponse(text);
  }

  throw new Error(
    `Unexpected fetch("${url}") during SSR — no "mockFetch" entry for this endpoint and it isn't a ` +
    `/locales/*.json request or a file built into dist. Add a "mockFetch" entry for this route in config/seo.json if this is intentional.`
  );
}

// A root-relative URL naming a file the build already wrote (e.g. /generated/<id>.json,
// fetched by the markdown feature's route guards). Paths escaping staticDir don't count.
function resolveStaticFile(url, staticDir) {
  if (!staticDir || typeof url !== 'string' || !url.startsWith('/')) return null;
  const root = path.resolve(staticDir);
  try {
    const filePath = path.resolve(root, '.' + decodeURIComponent(url.split(/[?#]/)[0]));
    if (!filePath.startsWith(root + path.sep)) return null;
    return fs.statSync(filePath).isFile() ? filePath : null;
  } catch {
    return null;
  }
}

function textResponse(body) {
  return {
    ok: true,
    status: 200,
    json: async () => JSON.parse(body),
    text: async () => body,
  };
}

function jsonResponse(body) {
  return {
    ok: true,
    status: 200,
    json: async () => body,
    text: async () => JSON.stringify(body),
  };
}
