// Tokens resolve to raw values: escaping happens at output, in html`` templates.
function readInputValue(el: HTMLElement): string {
  if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) return el.value;
  if (el.hasAttribute('contenteditable')) return el.innerText;
  return '';
}

// Exact token resolvers
const EXACT_TOKEN_RESOLVERS: Record<string, (el: HTMLElement, ev: Event) => any> = {
  '@id': (el) => el.id,
  '@class': (el) => el.className,
  '@name': (el) => (el as any).name ?? '',
  '@tag': (el) => el.tagName,

  '@value': (el) => readInputValue(el),
  '@checked': (el) => (el as HTMLInputElement).checked,
  '@selected': (el) => (el as HTMLOptionElement).selected,

  '@textContent': (el) => el.textContent ?? '',
  '@innerText': (el) => el.innerText ?? '',
  '@html': (el) => el.innerHTML ?? '',

  '@event': (_el, ev) => ev,
  '@target': (_el, ev) => ev.target,

  '@x': (_el, ev) => (ev as MouseEvent).clientX ?? 0,
  '@y': (_el, ev) => (ev as MouseEvent).clientY ?? 0,

  '@key': (_el, ev) => (ev as KeyboardEvent).key ?? '',
  '@code': (_el, ev) => (ev as KeyboardEvent).code ?? '',
};

// Prefix-based token resolvers
const PREFIXED_TOKEN_RESOLVERS: Record<string, (suffix: string, el: HTMLElement) => any> = {
  '@attr:': (suffix, el) => el.getAttribute(suffix) ?? '',
  '@dataset:': (suffix, el) => (el.dataset as any)[suffix] ?? '',
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
