// DOM reads that markup can't shadow ("DOM clobbering").
//
// A <form> exposes its named controls as own properties that override built-ins
// (HTMLFormElement is [LegacyOverrideBuiltIns]), and so does `document` for named
// <img>/<form>/<embed>/<object>/<iframe>: in `<form><input name="attributes"></form>`,
// `form.attributes` is the <input>. On a form or a document, every read here takes the
// getter or method from the prototype chain instead, which named properties never reach.
//
// Looked up on each node's own chain, not captured once from a global Element.prototype:
// nodes can come from another realm (a test's jsdom window, linkedom during SSR), whose
// getters refuse a foreign node.

const descriptors = new WeakMap<object, Map<PropertyKey, PropertyDescriptor | null>>();

function lookup(target: object, key: PropertyKey): PropertyDescriptor | null {
  const proto = Object.getPrototypeOf(target) as object | null;
  if (!proto) return null;
  let cached = descriptors.get(proto);
  if (!cached) {
    cached = new Map();
    descriptors.set(proto, cached);
  }
  if (cached.has(key)) return cached.get(key)!;

  let found: PropertyDescriptor | null = null;
  for (let current: object | null = proto; current; current = Object.getPrototypeOf(current)) {
    const descriptor = Object.getOwnPropertyDescriptor(current, key);
    if (descriptor) {
      found = descriptor;
      break;
    }
  }
  cached.set(key, found);
  return found;
}

// Only these let named properties override built-ins ([LegacyOverrideBuiltIns]); on any other
// node a plain read is the built-in (or a test's stub of it). The tag comes from the prototype
// (Symbol.toStringTag), which a named property can't shadow, and works across realms.
const OVERRIDING_TAGS = new Set(['[object HTMLFormElement]', '[object HTMLDocument]', '[object Document]', '[object XMLDocument]']);

function isOverriding(target: object): boolean {
  return OVERRIDING_TAGS.has(Object.prototype.toString.call(target));
}

// The built-in value of `key`: a getter's result, or a plain prototype value.
// undefined when the prototype chain has no such property.
export function prop<T = unknown>(target: object, key: PropertyKey): T {
  if (!isOverriding(target)) return (target as Record<PropertyKey, unknown>)[key] as T;
  const descriptor = lookup(target, key);
  if (!descriptor) return undefined as T;
  return (descriptor.get ? descriptor.get.call(target) : descriptor.value) as T;
}

export function assign(target: object, key: PropertyKey, value: unknown): void {
  if (!isOverriding(target)) {
    (target as Record<PropertyKey, unknown>)[key] = value;
    return;
  }
  const setter = lookup(target, key)?.set;
  if (!setter) throw new TypeError(`No built-in setter for "${String(key)}".`);
  setter.call(target, value);
}

export function invoke<T = unknown>(target: object, key: PropertyKey, ...args: unknown[]): T {
  const method = isOverriding(target)
    ? lookup(target, key)?.value
    : (target as Record<PropertyKey, unknown>)[key];
  if (typeof method !== 'function') throw new TypeError(`No built-in method "${String(key)}".`);
  return method.apply(target, args) as T;
}

export function attributesOf(el: Element): NamedNodeMap {
  return prop<NamedNodeMap>(el, 'attributes');
}

export function localNameOf(el: Element): string {
  return prop<string>(el, 'localName');
}

export function tagNameOf(el: Element): string {
  return prop<string>(el, 'tagName');
}

export function namespaceOf(el: Element): string | null {
  return prop<string | null>(el, 'namespaceURI');
}

export function getAttr(el: Element, name: string): string | null {
  return invoke<string | null>(el, 'getAttribute', name);
}

export function hasAttr(el: Element, name: string): boolean {
  return invoke<boolean>(el, 'hasAttribute', name);
}

export function setAttr(el: Element, name: string, value: string): void {
  invoke(el, 'setAttribute', name, value);
}

export function removeAttr(el: Element, name: string): void {
  invoke(el, 'removeAttribute', name);
}

export function removeNode(node: ChildNode): void {
  invoke(node, 'remove');
}

export function replaceNode(node: ChildNode, ...nodes: Node[]): void {
  invoke(node, 'replaceWith', ...nodes);
}

export function childNodesOf(node: Node): NodeListOf<ChildNode> {
  return prop<NodeListOf<ChildNode>>(node, 'childNodes');
}

export function parentNodeOf(node: Node): ParentNode | null {
  return prop<ParentNode | null>(node, 'parentNode');
}

export function parentElementOf(node: Node): HTMLElement | null {
  return prop<HTMLElement | null>(node, 'parentElement');
}

export function querySelectorAllOf<E extends Element = Element>(root: ParentNode, selector: string): E[] {
  return Array.from(invoke<NodeListOf<E>>(root, 'querySelectorAll', selector));
}

// Only an HTML <template> has a content getter: a <form> whose control is named
// "content", or an <svg><template>, gets null.
export function templateContentOf(el: Element): DocumentFragment | null {
  const getter = lookup(el, 'content')?.get;
  return getter ? (getter.call(el) as DocumentFragment | null) : null;
}

export function textOf(node: Node): string | null {
  return prop<string | null>(node, 'textContent');
}

export function setText(node: Node, value: string): void {
  assign(node, 'textContent', value);
}

export function innerTextOf(el: Element): string {
  return prop<string | undefined>(el, 'innerText') ?? '';
}

export function innerHtmlOf(el: Element): string {
  return prop<string>(el, 'innerHTML');
}

export function idOf(el: Element): string {
  return prop<string>(el, 'id');
}

export function classNameOf(el: Element): string {
  return prop<string>(el, 'className');
}

// `name` only exists on elements that have one (input, form, ...): '' elsewhere.
export function nameOf(el: Element): string {
  return prop<string | undefined>(el, 'name') ?? '';
}

export function datasetOf(el: Element): DOMStringMap {
  return prop<DOMStringMap | undefined>(el, 'dataset') ?? {};
}

export function scrollOf(el: Element): { top: number; left: number } {
  return { top: prop<number>(el, 'scrollTop') || 0, left: prop<number>(el, 'scrollLeft') || 0 };
}

export function addListener(target: EventTarget, event: string, listener: EventListener): void {
  invoke(target, 'addEventListener', event, listener);
}

export function removeListener(target: EventTarget, event: string, listener: EventListener): void {
  invoke(target, 'removeEventListener', event, listener);
}

// From `document` as well: a named <img name="createElement"> shadows document.createElement.
export function createElementIn<K extends keyof HTMLElementTagNameMap>(doc: Document, tagName: K): HTMLElementTagNameMap[K];
export function createElementIn(doc: Document, tagName: string): HTMLElement;
export function createElementIn(doc: Document, tagName: string): HTMLElement {
  return invoke<HTMLElement>(doc, 'createElement', tagName);
}
