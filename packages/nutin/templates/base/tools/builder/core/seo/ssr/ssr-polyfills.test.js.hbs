import fs from 'fs';
import os from 'os';
import path from 'path';
import { parseHTML } from 'linkedom';
import { installDocumentStubs, installSpecAccessors, resolveFetch } from './ssr-polyfills.js';

describe('resolveFetch (SSR fetch shim)', () => {
  let staticDir;

  beforeEach(() => {
    staticDir = fs.mkdtempSync(path.join(os.tmpdir(), 'nutin-ssr-fetch-'));
    fs.mkdirSync(path.join(staticDir, 'generated'));
    fs.writeFileSync(path.join(staticDir, 'generated', 'docs.json'), '{"pages":{"a":1}}');
    fs.writeFileSync(path.join(staticDir, 'notes.txt'), 'plain text');
  });

  afterEach(() => {
    fs.rmSync(staticDir, { recursive: true, force: true });
  });

  it('serves a mockFetch entry first', async () => {
    const response = await resolveFetch('/generated/docs.json', { mockFetch: { '/generated/docs.json': { mocked: true } }, staticDir });

    expect(await response.json()).toEqual({ mocked: true });
  });

  it('serves a file the build wrote, parsed as JSON for .json', async () => {
    const response = await resolveFetch('/generated/docs.json?v=1', { staticDir });

    expect(response.ok).toBeTruthy();
    expect(await response.json()).toEqual({ pages: { a: 1 } });
  });

  it('resolves a content-hashed data file URL to its mockFetch entry or its plain file', async () => {
    const mocked = await resolveFetch('/generated/docs.0123abcd.json', { mockFetch: { '/generated/docs.json': { mocked: true } }, staticDir });
    expect(await mocked.json()).toEqual({ mocked: true });

    const built = await resolveFetch('/generated/docs.0123abcd.json', { staticDir });
    expect(await built.json()).toEqual({ pages: { a: 1 } });
  });

  it('reads a content-hashed locale URL from the locales folder', async () => {
    const localesDir = path.join(staticDir, 'locales');
    fs.mkdirSync(localesDir);
    fs.writeFileSync(path.join(localesDir, 'en.json'), '{"title":"Hi"}');

    const response = await resolveFetch('/locales/en.0123abcd.json', { localesDir, staticDir });
    expect(await response.json()).toEqual({ title: 'Hi' });
  });

  it('serves other built files as text', async () => {
    const response = await resolveFetch('/notes.txt', { staticDir });

    expect(await response.text()).toBe('plain text');
  });

  it('refuses paths escaping the build folder', async () => {
    await expect(() => resolveFetch('/../../etc/hosts', { staticDir })).toThrow('Unexpected fetch');
    await expect(() => resolveFetch('/%2e%2e/%2e%2e/etc/hosts', { staticDir })).toThrow('Unexpected fetch');
  });

  it('still throws for an unknown endpoint', async () => {
    await expect(() => resolveFetch('/api/users', { staticDir })).toThrow('Unexpected fetch');
    await expect(() => resolveFetch('https://api.test/users', { staticDir })).toThrow('Unexpected fetch');
  });
});

describe('installSpecAccessors (SSR linkedom window)', () => {
  const getter = (window, ctorName, name) => Object.getOwnPropertyDescriptor(window[ctorName].prototype, name).get;

  it('exposes spec getters on the prototypes clobbering-proof code reads them from', () => {
    const { window } = parseHTML('<!doctype html><html><body><form><input name="children"></form></body></html>');
    installSpecAccessors(window);
    const form = window.document.querySelector('form');

    expect(getter(window, 'Element', 'children').call(form).length).toBe(1);
    expect(getter(window, 'Element', 'localName').call(form)).toBe('form');
    expect(getter(window, 'Element', 'namespaceURI').call(form)).toBe('http://www.w3.org/1999/xhtml');
    expect(getter(window, 'Node', 'nodeType').call(window.document.createTextNode('x'))).toBe(3);
    expect(getter(window, 'DocumentFragment', 'children').call(window.document.createDocumentFragment()).length).toBe(0);
  });

  it("dispatches Node.prototype's base-class stubs to the node's real accessor", () => {
    const { window } = parseHTML('<!doctype html><html><body><div><a></a><b></b>t</div></body></html>');
    installSpecAccessors(window);
    const div = window.document.querySelector('div');
    const [a, b, text] = div.childNodes;

    expect(getter(window, 'Node', 'childNodes').call(div).length).toBe(3);
    expect(getter(window, 'Node', 'firstChild').call(div)).toBe(a);
    expect(getter(window, 'Node', 'lastChild').call(div)).toBe(text);
    expect(getter(window, 'Node', 'nextSibling').call(a)).toBe(b);
    expect(getter(window, 'Node', 'previousSibling').call(b)).toBe(a);
    expect(getter(window, 'Node', 'textContent').call(div)).toBe('t');
    expect(getter(window, 'Node', 'parentNode').call(a)).toBe(div);
    expect(getter(window, 'Node', 'parentElement').call(a)).toBe(div);
    expect(getter(window, 'Node', 'ownerDocument').call(div)).toBe(window.document);
    expect(getter(window, 'Element', 'firstElementChild').call(div)).toBe(a);
    expect(getter(window, 'Element', 'nextElementSibling').call(a)).toBe(b);
  });

  it("reads a <template>'s content through the prototype getters", () => {
    const { window } = parseHTML('<!doctype html><html><body><template><i>z</i></template></body></html>');
    installSpecAccessors(window);
    const content = getter(window, 'HTMLTemplateElement', 'content').call(window.document.querySelector('template'));

    expect(getter(window, 'Node', 'childNodes').call(content).length).toBe(1);
    expect(getter(window, 'DocumentFragment', 'children').call(content).length).toBe(1);
  });

  it('writes through the derived setter', () => {
    const { window } = parseHTML('<!doctype html><html><body><div>old</div></body></html>');
    installSpecAccessors(window);
    const div = window.document.querySelector('div');

    Object.getOwnPropertyDescriptor(window.Node.prototype, 'textContent').set.call(div, 'new');

    expect(div.innerHTML).toBe('new');
  });

  it('is idempotent (linkedom shares its classes between windows)', () => {
    const { window } = parseHTML('<!doctype html><html><body><div><a></a></div></body></html>');
    installSpecAccessors(window);
    const before = getter(window, 'Node', 'childNodes');
    installSpecAccessors(parseHTML('<!doctype html><html><body></body></html>').window);

    expect(getter(window, 'Node', 'childNodes')).toBe(before);
    expect(before.call(window.document.querySelector('div')).length).toBe(1);
  });

  it('leaves newly created nodes working', () => {
    const { window } = parseHTML('<!doctype html><html><body></body></html>');
    installSpecAccessors(window);
    const div = window.document.createElement('div');

    div.textContent = 'hi';
    div.append(window.document.createElement('span'));

    expect(div.nodeType).toBe(1);
    expect(div.localName).toBe('div');
    expect(div.tagName).toBe('DIV');
    expect(div.childNodes.length).toBe(2);
    expect(div.cloneNode(true).outerHTML).toBe('<div>hi<span></span></div>');
  });

  it('keeps getter-only properties read-only', () => {
    const { window } = parseHTML('<!doctype html><html><body><div></div></body></html>');
    installSpecAccessors(window);
    const div = window.document.querySelector('div');

    expect(() => { div.children = []; }).toThrow('only a getter');
  });
});

describe('installDocumentStubs (SSR linkedom window)', () => {
  // Where core finds a document method: the prototype chain, never the document itself (safe-dom.helper).
  const fromPrototypes = (target, key) => {
    for (let proto = Object.getPrototypeOf(target); proto; proto = Object.getPrototypeOf(proto)) {
      const descriptor = Object.getOwnPropertyDescriptor(proto, key);
      if (descriptor) return descriptor.value;
    }
    return undefined;
  };

  it('gives the document a getSelection() on its prototype chain that returns null', () => {
    const { window } = parseHTML('<!doctype html><html><body><img name="getSelection"></body></html>');
    installDocumentStubs(window);

    expect(typeof fromPrototypes(window.document, 'getSelection')).toBe('function');
    expect(fromPrototypes(window.document, 'getSelection').call(window.document)).toBe(null);
  });

  it('is idempotent (linkedom shares its classes between windows)', () => {
    const { window } = parseHTML('<!doctype html><html><body></body></html>');
    installDocumentStubs(window);
    const before = fromPrototypes(window.document, 'getSelection');
    installDocumentStubs(parseHTML('<!doctype html><html><body></body></html>').window);

    expect(fromPrototypes(window.document, 'getSelection')).toBe(before);
  });
});
