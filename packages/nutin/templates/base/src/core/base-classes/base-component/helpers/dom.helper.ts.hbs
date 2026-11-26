import * as SecurityHelper from "./security.helper.js";
import * as SafeDom from "./safe-dom.helper.js";
import type { BaseComponent } from "../base-component.js";

// Element.moveBefore() isn't in TypeScript's DOM lib yet.
type MovableParent = ParentNode & { moveBefore?: (node: Node, child: Node | null) => void };

// Root element of every component instance, mapped to that instance,
// so a parent can tell its own nodes apart from the ones nested components own,
// and reach a child's instance from its root.
const componentRoots = new WeakMap<Element, BaseComponent>();

export function markComponentRoot(element: HTMLElement, instance: BaseComponent): void {
  componentRoots.set(element, instance);
}

export function getComponentOf(element: Element): BaseComponent | undefined {
  return componentRoots.get(element);
}

// True when `el` lives inside another component's root below `root`.
// SafeDom: a <form> holding <input name="parentElement"> otherwise send this walk back down to the input,
// and from there to the form again, forever.
export function isInsideNestedComponent(el: Element, root: Element): boolean {
  let current = SafeDom.parentElementOf(el);
  while (current && current !== root) {
    if (componentRoots.has(current)) return true;
    current = SafeDom.parentElementOf(current);
  }
  return false;
}

// State-preserving move (focus, iframes, animations, custom elements),
// only possible when both the node and the target parent are in the document.
export function canMoveBefore(parent: ParentNode, node: Node): boolean {
  return typeof (parent as MovableParent).moveBefore === 'function'
    && parent.isConnected
    && node.isConnected;
}

export function moveBefore(parent: ParentNode, node: Node, child: Node | null): void {
  (parent as MovableParent).moveBefore!(node, child);
}

// Chrome restarts the CSS animations of a subtree moved into a parent whose style
// hasn't been computed yet (e.g. created in the same task).
// Computing it first, before any move dirties it again, keeps them running.
export function prepareMoveTarget(parent: ParentNode | null, node: Node): void {
  if (parent instanceof Element && canMoveBefore(parent, node)) {
    void getComputedStyle(parent).display;
  }
}

// Puts an already-mounted element where a placeholder is,
// moving it without detaching it when the browser supports it.
export function replacePlaceholder(element: HTMLElement, placeholder: HTMLElement): void {
  const parent = placeholder.parentNode;
  if (parent && canMoveBefore(parent, element)) {
    moveBefore(parent, element, placeholder);
    placeholder.remove();
  } else {
    placeholder.replaceWith(element);
  }
}

export function mountElement(element: HTMLElement, mountTarget: string | HTMLElement): void {
  const target = typeof mountTarget === 'string'
    ? document.querySelector(mountTarget)
    : mountTarget;

  // Nothing would show up, and nothing else says why (e.g. a misspelled selector, or no #app).
  // Not in prod bundles: they drop the console call, but not the work that builds its message.
  if (!globalThis.__NUTIN_PROD__ && !(target instanceof HTMLElement)) {
    const where = typeof mountTarget === 'string' ? `"${mountTarget}" isn't in the page` : `its mount target is ${mountTarget}`;
    console.error(`Nothing to mount <${element.tagName.toLowerCase()}> into: ${where}.`);
  }

  if (!(target instanceof HTMLElement)) return;
  if (typeof mountTarget === 'string') {
    // A selector: the element is appended to it.
    target.appendChild(element);
  } else {
    // A placeholder element: the mounted element takes its place, with its attributes.
    copyAttributes(target, element);
    target.replaceWith(element);
  }
}

export function createElement<T extends HTMLElement>(
  tagName: keyof HTMLElementTagNameMap, 
  template: string = '',
  trustLevel?: Nutin.TrustLevel
): T {
  const element = document.createElement(tagName) as T;
  element.replaceChildren(SecurityHelper.sanitizeToFragment(template, trustLevel));
  return element;
}

// Scoped to the rendering component (a detached one included);
// the document-wide default only serves direct callers.
export function cleanupOptionalContent(root: ParentNode = document): void {
  const isEmpty = (el: HTMLElement): boolean => {
    if (el instanceof HTMLImageElement) {
      return !el.src || el.src.trim() === "";
    }

    if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) {
      return !el.value?.trim();
    }

    if (el instanceof HTMLMediaElement || el instanceof HTMLSourceElement) {
      return !el.getAttribute("src");
    }

    const content = SafeDom.textOf(el)?.trim();
    return !content || content === "undefined" || content === "null";
  };

  const isValueUndefined = (el: HTMLElement): boolean => {
    const value = SafeDom.getAttr(el, "data-optional");
    /*
    A bare/empty data-optional (getAttribute returns "") is a plain marker and
    defers entirely to isEmpty(el) below rather than forcing removal itself.
    Only a present-but-blank value (whitespace) or the literal string produced
    by interpolating an undefined/null expression counts as "value undefined".
    */
    if (!value) return false;
    return (
      value.trim() === '' ||
      value === "undefined" ||
      value === "null"
    );
  }

  SafeDom.querySelectorAllOf<HTMLElement>(root, "[data-optional]").forEach(el => {
    if (isValueUndefined(el) || isEmpty(el)) SafeDom.removeNode(el);
    SafeDom.removeAttr(el, "data-optional");
  });
}

// Carries placeholder attributes (class, id, aria-*, data-*...) onto the mounted element.
// data-component is skipped so an ancestor's child lookup can't re-match it.
function copyAttributes(from: HTMLElement, to: HTMLElement): void {
  Array.from(SafeDom.attributesOf(from)).forEach(attr => {
    if (attr.name === 'data-component') return;
    if (attr.name === 'class') {
      to.classList.add(...Array.from(SafeDom.prop<DOMTokenList>(from, 'classList')));
      return;
    }
    to.setAttribute(attr.name, attr.value);
  });
}
