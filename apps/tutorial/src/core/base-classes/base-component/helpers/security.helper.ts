// Compared against localName, so SVG/MathML elements of the same name are caught too.
// style/link restyle the whole page, base moves every relative URL, meta can refresh/navigate.
import * as SafeDom from './safe-dom.helper.js';

const STRIPPED_TAGS = new Set(['script', 'style', 'link', 'base', 'meta']);
const STRICT_STRIPPED_TAGS = new Set(['iframe', 'object', 'embed', 'frame']);

// A data: document in a frame runs its own scripts (opaque origin): only allowed at 'trusted'.
const FRAME_TAGS = new Set(['iframe', 'object', 'embed', 'frame']);
const FRAME_URL_ATTRS = new Set(['src', 'data']);
const URL_ATTRS = new Set([
  'href',
  'src',
  'action',
  'formaction',
  'poster',
  'background',
  'xlink:href',
]);

// Attributes Nutin acts on after render: in injected markup they bind to the component's methods/children.
const BINDING_ATTRS = [
  'data-event',
  'data-component',
  'data-catalog',
  'data-bind',
  'data-i18n',
  'data-pipe',
  'data-pipe-source',
];

// SVG <animate>/<set> can rewrite an attribute after sanitization: drop those targeting a URL attribute.
const ATTR_ANIMATION_TAGS = new Set(['animate', 'set']);

// javascript: is stripped from 'normal' up; data: only under 'strict' (data: images are legitimate).
const SCRIPT_URL_SCHEME = /^javascript:/i;
const STRICT_URL_SCHEMES = /^(javascript|data):/i;

// String form of sanitizeToFragment(). Rendering inserts the fragment instead: assigning
// this string to innerHTML parses it a second time.
export function sanitizeTemplate(value: unknown, trustLevel: Nutin.TrustLevel = 'normal'): string {
  if (value === null || value === undefined) return '';
  if (trustLevel === 'trusted' && !rawsOf(value)) return String(value);

  return sanitizedHolder(value, trustLevel).innerHTML;
}

export function escapeHtml(value: unknown): string {
  if (value === null || value === undefined) return '';

  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Parses once and returns the sanitized nodes: inserting them directly means the browser never re-parses the
// cleaned markup, which is where mutation XSS turns inert text back into elements.
// A SafeHtml from html`` may carry raw() sources behind placeholders: each is parsed once,
// in its real parent context, stripped of bindings and sanitized as nodes, then put in place.
export function sanitizeToFragment(value: unknown, trustLevel: Nutin.TrustLevel = 'normal'): DocumentFragment {
  return sanitizedHolder(value, trustLevel).content;
}

// Parsed and sanitized in a <template>: its content for the render path, its innerHTML for the string form.
function sanitizedHolder(value: unknown, trustLevel: Nutin.TrustLevel): HTMLTemplateElement {
  const holder = newTemplate();
  const raws = rawsOf(value);
  holder.innerHTML = value === null || value === undefined ? '' : raws ? (value as { value: string }).value : String(value);
  for (const root of templateRootsOf(holder)) {
    if (trustLevel !== 'trusted') sanitizeNode(root, trustLevel);
    if (raws) resolveRaws(root, raws, trustLevel);
  }
  return holder;
}

// raw() in attribute position (`<a ${raw('aria-current="page"')}>`): rebuilt from the parsed
// attributes, minus event handlers, srcdoc, bindings and script URLs.
export function sanitizeAttributes(source: string): string {
  const holder = newTemplate();
  holder.innerHTML = `<span ${source}></span>`;
  // An unterminated quote makes the parser drop the whole tag: nothing to keep.
  const el = holder.content.firstElementChild;
  if (!el) return '';
  return Array.from(el.attributes)
    .filter((attr) => isAllowedRawAttribute(attr.name.toLowerCase(), attr.value))
    .map((attr) => `${attr.name}="${escapeHtml(attr.value)}"`)
    .join(' ');
}

// A javascript: URL in a URL attribute (name lowercased). html`` checks values from data with it at
// every trust level, since the render sanitizer doesn't run at 'trusted'.
export function isScriptUrl(name: string, value: string): boolean {
  return URL_ATTRS.has(name) && isDangerousUrl(value, 'normal');
}

export function stripBindings(markup: string): string {
  const holder = newTemplate();
  holder.innerHTML = markup;
  templateRootsOf(holder).forEach(stripBindingsFrom);
  return holder.innerHTML;
}

// What every raw() source loses, at every trust level: binding attributes and clobbering names.
// String form, for SafeHtml.toString(); rendering does the same on nodes (resolveRaws).
export function stripRawMarkup(markup: string): string {
  const holder = newTemplate();
  holder.innerHTML = markup;
  templateRootsOf(holder).forEach((root) => {
    stripBindingsFrom(root);
    stripClobberingNamesFrom(root);
  });
  return holder.innerHTML;
}

// In place, inside <template> content too. Also used by SEO prerendering: nothing binds a
// prerendered page (the app re-renders it), so its binding attributes are dead weight.
export function stripBindingsFrom(root: ParentNode): void {
  const selector = BINDING_ATTRS.map((attr) => `[${attr}]`).join(',');
  SafeDom.querySelectorAllOf(root, selector).forEach((el) => {
    BINDING_ATTRS.forEach((attr) => SafeDom.removeAttr(el, attr));
  });
  SafeDom.querySelectorAllOf(root, 'template').forEach((el) => templateRootsOf(el).forEach(stripBindingsFrom));
}

// An id/name that names a document or form property shadows it once inserted:
// <img name="createElement"> replaces document.createElement for the whole app, and
// <input name="parentElement"> replaces its form's parentElement. Only raw() markup loses
// them: an author's own name="title" or name="action" field is legitimate.
// __NUTIN* ids would shadow Nutin's globals through window's named access.
export function stripClobberingNamesFrom(root: ParentNode): void {
  SafeDom.querySelectorAllOf(root, '[id],[name]').forEach((el) => {
    ['id', 'name'].forEach((attr) => {
      const value = SafeDom.getAttr(el, attr);
      if (value !== null && isClobberingName(value)) SafeDom.removeAttr(el, attr);
    });
  });
  SafeDom.querySelectorAllOf(root, 'template').forEach((el) => templateRootsOf(el).forEach(stripClobberingNamesFrom));
}

let formProbe: HTMLFormElement | null = null;

function isClobberingName(value: string): boolean {
  if (value === '') return false;
  // A fresh form, so its own named controls can't add names; re-created for another realm's document.
  if (!formProbe || formProbe.ownerDocument !== document) formProbe = SafeDom.createElementIn(document, 'form');
  return value in document || value in formProbe || value.startsWith('__NUTIN');
}

function newTemplate(): HTMLTemplateElement {
  return SafeDom.createElementIn(document, 'template');
}

// Where a <template>'s nodes are: its content, plus its own children in a DOM that doesn't
// follow the spec there. linkedom (SEO prerendering) parses a template's markup into its
// children, serializes those for innerHTML/outerHTML, and fills content with a copy on first
// read: cleaning only the content would ship the original. Browsers and jsdom give a parsed
// template no children, so for them this is the content alone. [] for a non-template.
function templateRootsOf(el: Element): ParentNode[] {
  const content = SafeDom.templateContentOf(el);
  if (!content) return [];
  return SafeDom.childNodesOf(el).length > 0 ? [content, el] : [content];
}

function rawsOf(value: unknown): ReadonlyMap<string, string> | null {
  const raws = (value as { raws?: unknown } | null)?.raws;
  return raws instanceof Map ? raws : null;
}

function resolveRaws(root: ParentNode, raws: ReadonlyMap<string, string>, trustLevel: Nutin.TrustLevel): void {
  // Snapshot first: content put in place is never searched for placeholders again.
  for (const placeholder of collectPlaceholders(root)) {
    const source = raws.get(SafeDom.getAttr(placeholder, 'data-nutin-raw') ?? '');
    const parsed = parseInContext(source ?? '', SafeDom.parentNodeOf(placeholder));
    if (trustLevel !== 'trusted') sanitizeNode(parsed, trustLevel);
    stripBindingsFrom(parsed);
    stripClobberingNamesFrom(parsed);
    SafeDom.replaceNode(placeholder, ...Array.from(SafeDom.childNodesOf(parsed as Node)));
  }
}

function collectPlaceholders(root: ParentNode): Element[] {
  const found: Element[] = [];
  SafeDom.querySelectorAllOf(root, 'template').forEach((el) => {
    if (SafeDom.hasAttr(el, 'data-nutin-raw')) found.push(el);
    templateRootsOf(el).forEach((inner) => found.push(...collectPlaceholders(inner)));
  });
  return found;
}

// Parses inside the inert document behind <template> (nothing loads or runs there), using an
// element like the placeholder's parent as context so <svg>/<math>/<table> content parses as
// it will once inserted.
function parseInContext(source: string, parent: Node | null): ParentNode {
  const holder = newTemplate();
  const parentEl = parent && SafeDom.prop<number>(parent, 'nodeType') === 1 ? (parent as Element) : null;
  if (parentEl && !SafeDom.templateContentOf(parentEl)) {
    const context = holder.content.ownerDocument.createElementNS(SafeDom.namespaceOf(parentEl), SafeDom.localNameOf(parentEl));
    context.innerHTML = source;
    return context;
  }
  holder.innerHTML = source;
  return holder.content;
}

function isAllowedRawAttribute(name: string, value: string): boolean {
  if (!/^[a-z_:][-a-z0-9_:.]*$/.test(name)) return false;
  if (name.startsWith('on') || name === 'srcdoc' || BINDING_ATTRS.includes(name)) return false;
  return !isScriptUrl(name, value);
}

function sanitizeNode(root: ParentNode, trustLevel: Nutin.TrustLevel): void {
  // Snapshot first: removing an element while walking a live list would skip the next one.
  // Descendants of a removed element are still visited, which is harmless.
  // Every read goes through SafeDom: a <form>'s controls can shadow attributes, localName,
  // removeAttribute, ... (<form onclick=…><input name="attributes"> would hide its handler).
  for (const el of SafeDom.querySelectorAllOf(root, '*')) {
    const tag = SafeDom.localNameOf(el).toLowerCase();

    if (STRIPPED_TAGS.has(tag)
      || (trustLevel === 'strict' && STRICT_STRIPPED_TAGS.has(tag))
      || animatesUrlAttribute(el, tag)) {
      SafeDom.removeNode(el);
      continue;
    }

    const attrs = SafeDom.attributesOf(el);
    // Backwards, so a removal doesn't shift the attributes still to check.
    for (let i = attrs.length - 1; i >= 0; i--) {
      const attr = attrs[i]!;
      const name = attr.name.toLowerCase();
      // srcdoc is parsed as a same-origin document: escaped markup in it is decoded and runs.
      if ((name.startsWith('on') || name === 'srcdoc')
        || (URL_ATTRS.has(name) && isDangerousUrl(attr.value, trustLevel))
        || (FRAME_TAGS.has(tag) && FRAME_URL_ATTRS.has(name) && isDangerousUrl(attr.value, 'strict'))) {
        SafeDom.removeAttr(el, attr.name);
      }
    }

    // querySelectorAll() doesn't look into <template> content (nor, in linkedom, its children).
    templateRootsOf(el).forEach((inner) => sanitizeNode(inner, trustLevel));
  }
}

function animatesUrlAttribute(el: Element, tag: string): boolean {
  if (!ATTR_ANIMATION_TAGS.has(tag)) return false;
  const target = (SafeDom.getAttr(el, 'attributeName') ?? '').trim().toLowerCase();
  return URL_ATTRS.has(target) || URL_ATTRS.has(target.replace(/^xlink:/, ''));
}

function isDangerousUrl(value: string, trustLevel: Nutin.TrustLevel): boolean {
  // Browsers strip ASCII tab/newline/CR from a URL (and trim leading C0
  // control/space) before scheme-sniffing, so "java\tscript:" still runs
  // as javascript: — normalize the same way before checking the scheme.
  const normalized = value.replace(/[\t\n\r]/g, '').replace(/^[\x00-\x20]+/, '');
  const schemes = trustLevel === 'strict' ? STRICT_URL_SCHEMES : SCRIPT_URL_SCHEME;
  return schemes.test(normalized);
}
