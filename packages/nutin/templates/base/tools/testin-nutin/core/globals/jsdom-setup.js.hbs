import fs from 'fs';
import path from 'path';
import { JSDOM } from 'jsdom';
import config from '#root/nutin.config.js';

let currentDom = null;
const nativeGlobalKeys = new Set(Object.getOwnPropertyNames(global));

export function setupJsdom(htmlPath = 'dist/src/index.html') {
  const html = fs.readFileSync(path.resolve(process.cwd(), htmlPath), 'utf8');

  const {
    runScripts,
    resources,
    freezeGlobals,
    pretendToBeVisual,
  } = config.testinNutin.jsdomOptions;

  const dom = new JSDOM(html, {
    url: 'http://localhost',
    runScripts: runScripts ? 'dangerously' : undefined,
    resources: resources ? 'usable' : undefined,
    pretendToBeVisual,
  });

  currentDom = dom;

  global.window = dom.window;
  global.document = dom.window.document;

  // DOM globals — re-synced every call so classes like HTMLInputElement always
  // match the current jsdom realm, not whichever realm happened to run first.
  // Real Node globals (console, setTimeout, fetch, Event, ...) are left untouched.
  Object.getOwnPropertyNames(dom.window)
    .filter(prop => !nativeGlobalKeys.has(prop))
    .forEach(prop => {
      global[prop] = dom.window[prop];
  });

  global.localStorage = dom.window.localStorage;

  window.matchMedia ??= () => ({
    matches: false,
    addEventListener: () => {},
    removeEventListener: () => {},
  });

  // jsdom already ships a real (but "not implemented") scrollTo, so ??= never
  // fires here — always override it with a working no-op.
  window.scrollTo = () => {};

  // jsdom doesn't implement Element.prototype.scrollIntoView at all (no layout
  // engine to compute a real scroll position), so any code calling it throws.
  window.Element.prototype.scrollIntoView ??= function () {};

  window.requestAnimationFrame ??= (cb) => setTimeout(cb, 0);
  window.cancelAnimationFrame ??= (id) => clearTimeout(id);

  window.IntersectionObserver ??= class {
    constructor() {}
    observe() {}
    unobserve() {}
    disconnect() {}
  };

  window.ResizeObserver ??= class {
    constructor() {}
    observe() {}
    unobserve() {}
    disconnect() {}
  };

  if (freezeGlobals) {
    Object.freeze(global.window);
    Object.freeze(global.document);
  }

  return dom;
}

export function teardownJsdom() {
  if (currentDom) {
    try {
      currentDom.window.close();
    } catch {}
  }

  currentDom = null;

  delete global.window;
  delete global.document;
  delete global.localStorage;
}

export function resetDom() {
  if (!global.document) return;

  document.body.innerHTML = '';
  document.head.innerHTML = '<meta charset="UTF-8">';

  if (global.localStorage) {
    localStorage.clear();
  }
}

export function flushPromises() {
  return new Promise(setImmediate);
}

export const $ = (selector) => document.querySelector(selector);
export const $$ = (selector) => [...document.querySelectorAll(selector)];
