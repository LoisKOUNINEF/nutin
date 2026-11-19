import * as SafeDom from './safe-dom.helper.js';

// Tokens resolve to raw values: escaping happens at output, in html`` templates.
function readInputValue(el: HTMLElement): string {
  if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement || el instanceof HTMLSelectElement) return el.value;
  if (SafeDom.hasAttr(el, 'contenteditable')) return SafeDom.innerTextOf(el);
  return '';
}

// Exact token resolvers
const EXACT_TOKEN_RESOLVERS: Record<string, (el: HTMLElement, ev: Event) => any> = {
  '@id': (el) => SafeDom.idOf(el),
  '@class': (el) => SafeDom.classNameOf(el),
  '@name': (el) => SafeDom.nameOf(el),
  '@tag': (el) => SafeDom.tagNameOf(el),

  '@value': (el) => readInputValue(el),
  '@checked': (el) => (el as HTMLInputElement).checked,
  '@selected': (el) => (el as HTMLOptionElement).selected,

  '@textContent': (el) => SafeDom.textOf(el) ?? '',
  '@innerText': (el) => SafeDom.innerTextOf(el),
  '@html': (el) => SafeDom.innerHtmlOf(el) ?? '',

  '@event': (_el, ev) => ev,
  '@target': (_el, ev) => ev.target,

  '@x': (_el, ev) => (ev as MouseEvent).clientX ?? 0,
  '@y': (_el, ev) => (ev as MouseEvent).clientY ?? 0,

  '@key': (_el, ev) => (ev as KeyboardEvent).key ?? '',
  '@code': (_el, ev) => (ev as KeyboardEvent).code ?? '',
};

// Prefix-based token resolvers
const PREFIXED_TOKEN_RESOLVERS: Record<string, (suffix: string, el: HTMLElement) => any> = {
  '@attr:': (suffix, el) => SafeDom.getAttr(el, suffix) ?? '',
  '@dataset:': (suffix, el) => SafeDom.datasetOf(el)[suffix] ?? '',
};

const customResolvers: Record<string, (el: HTMLElement, ev: Event) => any> = {};

export function resolve(token: string, el: Element, event: Event): any {
  const htmlEl = el as HTMLElement;

  return (
    resolveExact(token, htmlEl, event) ??
    resolvePrefixed(token, htmlEl) ??
    resolveCustom(token, htmlEl, event) ??
    resolveLiteral(token) ??
    token
  );
}

/** Register a new exact token like "@foo" */
export function registerCustomToken(
  name: string,
  resolver: (el: HTMLElement, ev: Event) => any
): void {
  customResolvers[name] = resolver;
}

/** Register a new prefixed token like "@style:" */
export function registerPrefixedToken(
  prefix: string,
  resolver: (suffix: string, el: HTMLElement) => any
): void {
  PREFIXED_TOKEN_RESOLVERS[prefix] = resolver;
}

function resolveExact(token: string, el: HTMLElement, ev: Event): any | null {
  const resolver = EXACT_TOKEN_RESOLVERS[token];
  return resolver ? resolver(el, ev) : null;
}

function resolvePrefixed(token: string, el: HTMLElement): any | null {
  for (const [prefix, resolver] of Object.entries(PREFIXED_TOKEN_RESOLVERS)) {
    if (token.startsWith(prefix)) {
      return resolver(token.slice(prefix.length), el);
    }
  }
  return null;
}

function resolveCustom(token: string, el: HTMLElement, ev: Event): any | null {
  const resolver = customResolvers[token];
  return resolver ? resolver(el, ev) : null;
}

function resolveLiteral(token: string): any | null {
  // string literal
  if (
    (token.startsWith('"') && token.endsWith('"')) ||
    (token.startsWith("'") && token.endsWith("'"))
  ) {
    return token.slice(1, -1);
  }
  // number literal
  if (!isNaN(Number(token))) {
    return Number(token);
  }
  return null;
}
