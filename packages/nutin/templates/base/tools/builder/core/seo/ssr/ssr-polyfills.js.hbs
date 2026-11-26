import fs from 'fs';
import path from 'path';
import { UserError } from '../../../../utils/error-exit.js';

/**
 * Installs the minimum browser globals the framework's own base classes touch unconditionally,
 * plus a couple of cheap defensive stubs (matchMedia) for common patterns downstream projects add.
 *
 * Returns `trackedFetches`, the in-flight promises served by the fetch shim during this render.
 * ssr-render.js awaits these before capturing markup, to let any resulting fetch-driven re-render complete first.
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

// Accessors the DOM spec defines on these exact prototypes.
// Clobbering-proof code reads them with `Object.getOwnPropertyDescriptor(proto, name).get`,
// often at module load, then calls that getter on any node.
// linkedom doesn't match the spec here:
// - some live on a mixin below the named prototype (`children` on ParentNode): no own getter;
// - some are per-instance data (`nodeType`, `localName`, `parentNode`), on no prototype at all;
// - Node.prototype has base-class stubs (`childNodes` → empty, `firstChild` → null, …) that
//   Element/CharacterData override: called on a real element, they return nothing.
// Each one becomes a getter that dispatches to what `node[name]` would actually resolve to.
// SSR only: jsdom (used by the tests) and browsers already define them this way.
const SPEC_ACCESSORS = {
  Node: [
    'nodeType', 'nodeName', 'ownerDocument', 'parentNode', 'parentElement', 'childNodes',
    'firstChild', 'lastChild', 'previousSibling', 'nextSibling', 'textContent',
  ],
  Element: ['children', 'attributes', 'localName', 'namespaceURI', 'tagName', 'firstElementChild', 'nextElementSibling'],
  DocumentFragment: ['children'],
  HTMLTemplateElement: ['content'],
};

const SPEC_ACCESSOR_TAG = Symbol.for('nutin.ssr.specAccessor');

function findDescriptor(proto, name) {
  for (let p = proto; p; p = Object.getPrototypeOf(p)) {
    const desc = Object.getOwnPropertyDescriptor(p, name);
    if (desc) return desc;
  }
  return undefined;
}

// The accessor of the most-derived class between the node and `proto` (excluded), if any.
function derivedAccessor(node, proto, name) {
  for (let p = Object.getPrototypeOf(node); p && p !== proto; p = Object.getPrototypeOf(p)) {
    const desc = Object.getOwnPropertyDescriptor(p, name);
    if (desc && (desc.get || desc.set)) return desc;
  }
  return undefined;
}

function defineDispatchingAccessor(proto, name) {
  // What the prototype resolved to before: its own getter or stub, a mixin's getter, or nothing.
  const fallback = findDescriptor(proto, name);
  const get = function () {
    const derived = derivedAccessor(this, proto, name);
    if (derived?.get) return derived.get.call(this);
    const own = Object.getOwnPropertyDescriptor(this, name);
    if (own && 'value' in own) return own.value;
    return fallback?.get ? fallback.get.call(this) : fallback?.value;
  };
  get[SPEC_ACCESSOR_TAG] = true;
  Object.defineProperty(proto, name, {
    configurable: true,
    enumerable: fallback?.enumerable ?? true,
    get,
    set(value) {
      const accessor = derivedAccessor(this, proto, name) ?? (fallback?.get || fallback?.set ? fallback : undefined);
      if (accessor?.set) return accessor.set.call(this, value);
      // Getter-only, as before this was installed (and as in a browser's strict code).
      if (accessor) throw new TypeError(`Cannot set property ${name} of ${this}, which has only a getter`);
      // Per-instance data (linkedom's constructor runs `this.nodeType = …`): keep it on the node.
      Object.defineProperty(this, name, { value, writable: true, enumerable: true, configurable: true });
    },
  });
}

/**
 * Document methods linkedom doesn't implement but core calls.
 * - getSelection(): kept children capture and restore the text selection (preservation.helper).
 *   SSR has no selection, so it returns null.
 * Defined on the document's prototype: core reads document methods from the prototype chain,
 * where a named element can't shadow them (safe-dom.helper). Idempotent, like installSpecAccessors().
 */
export function installDocumentStubs(window) {
  const proto = Object.getPrototypeOf(window.document);
  if (!proto || 'getSelection' in proto) return;
  Object.defineProperty(proto, 'getSelection', { value: () => null, writable: true, configurable: true });
}

/**
 * Makes the SSR window's DOM prototypes carry the accessors the spec puts on them, so code
 * that reads `Object.getOwnPropertyDescriptor(Element.prototype, 'children').get` works.
 * Idempotent: linkedom's classes are shared by every window it creates.
 */
export function installSpecAccessors(window) {
  for (const [ctorName, names] of Object.entries(SPEC_ACCESSORS)) {
    const proto = window[ctorName]?.prototype;
    if (!proto) continue;
    for (const name of names) {
      const current = Object.getOwnPropertyDescriptor(proto, name);
      if (current?.get?.[SPEC_ACCESSOR_TAG]) continue;
      if (current && !current.configurable) continue;
      defineDispatchingAccessor(proto, name);
    }
  }
}

export function installGlobals(window, { lang, mockFetch = {}, localesDir, staticDir } = {}) {
  // Before anything imports the bundle: its modules may read these getters as they load.
  installSpecAccessors(window);
  installDocumentStubs(window);
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

// A prod bundle fetches the runtime JSON files by their content-hashed copy's URL
// (prod-bundle/data-files.js): /locales/en.3fa9c21b.json is /locales/en.json.
const DATA_FILE_HASH = /\.[0-9a-f]{8}(\.json)$/;

export async function resolveFetch(url, { mockFetch = {}, localesDir, staticDir } = {}) {
  const plainUrl = typeof url === 'string' ? url.replace(DATA_FILE_HASH, '$1') : url;
  for (const key of [url, plainUrl]) {
    if (Object.prototype.hasOwnProperty.call(mockFetch, key)) return jsonResponse(mockFetch[key]);
  }

  const localeMatch = /^\/locales\/([a-zA-Z-]+)\.json$/.exec(plainUrl ?? '');
  if (localeMatch) {
    const filePath = path.join(localesDir, `${localeMatch[1]}.json`);
    if (fs.existsSync(filePath)) {
      const body = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      return jsonResponse(body);
    }
    // No translations authored for this locale yet — a normal early-project state, not an error.
    return jsonResponse({});
  }

  const staticFile = resolveStaticFile(url, staticDir) ?? resolveStaticFile(plainUrl, staticDir);
  if (staticFile) {
    const text = fs.readFileSync(staticFile, 'utf-8');
    return staticFile.endsWith('.json') ? jsonResponse(JSON.parse(text)) : textResponse(text);
  }

  throw new UserError(
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
