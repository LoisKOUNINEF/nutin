import fs from 'fs';
import path from 'path';

/**
 * Installs the minimum browser globals the framework's own base classes touch
 * unconditionally (Service's `beforeunload` listener, I18n's `navigator`/`window.location`
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
  } catch {
    // genuinely non-configurable — skip, whatever Node/linkedom already provides stands
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

export function installGlobals(window, { lang, mockFetch = {}, localesDir } = {}) {
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
    const promise = resolveFetch(url, { mockFetch, localesDir });
    trackedFetches.push(promise);
    return promise;
  };
  setGlobal(globalThis, 'fetch', fetchShim);
  setGlobal(window, 'fetch', fetchShim);

  return { trackedFetches };
}

async function resolveFetch(url, { mockFetch, localesDir }) {
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

  throw new Error(
    `Unexpected fetch("${url}") during SSR — no "mockFetch" entry for this endpoint and it isn't a ` +
    `/locales/*.json request. Add a "mockFetch" entry for this route in config/seo.json if this is intentional.`
  );
}

function jsonResponse(body) {
  return {
    ok: true,
    status: 200,
    json: async () => body,
    text: async () => JSON.stringify(body),
  };
}
