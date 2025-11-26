import { SecurityHelper } from './security.helper.js';

// Exact token resolvers
const EXACT_TOKEN_RESOLVERS: Record<string, (el: HTMLElement, ev: Event) => any> = {
  '@id': (el) => SecurityHelper.escapeHtml(el.id),
  '@class': (el) => SecurityHelper.escapeHtml(el.className),
  '@name': (el) => SecurityHelper.escapeHtml((el as any).name ?? ''),
  '@tag': (el) => SecurityHelper.escapeHtml(el.tagName),

  '@value': (el) => SecurityHelper.sanitizeInputElement(el as any),
  '@checked': (el) => (el as HTMLInputElement).checked,
  '@selected': (el) => (el as HTMLOptionElement).selected,

  '@textContent': (el) => SecurityHelper.escapeHtml(el.textContent ?? ''),
  '@innerText': (el) => SecurityHelper.escapeHtml(el.innerText ?? ''),
  '@html': (el) => SecurityHelper.escapeHtml(el.innerHTML ?? ''),

  '@event': (_el, ev) => ev,
  '@target': (_el, ev) => ev.target,

  '@x': (_el, ev) => (ev as MouseEvent).clientX ?? 0,
  '@y': (_el, ev) => (ev as MouseEvent).clientY ?? 0,

  '@key': (_el, ev) => SecurityHelper.escapeHtml((ev as KeyboardEvent).key ?? ''),
  '@code': (_el, ev) => SecurityHelper.escapeHtml((ev as KeyboardEvent).code ?? ''),
};

// Prefix-based token resolvers
const PREFIXED_TOKEN_RESOLVERS: Record<string, (suffix: string, el: HTMLElement) => any> = {
  '@attr:': (suffix, el) => SecurityHelper.escapeHtml(el.getAttribute(suffix) ?? ''),
  '@dataset:': (suffix, el) => SecurityHelper.escapeHtml((el.dataset as any)[suffix] ?? ''),
};

export class TokenHelper {
  private static customResolvers: Record<string, (el: HTMLElement, ev: Event) => any> = {};

  public static resolve(token: string, el: Element, event: Event): any {
    const htmlEl = el as HTMLElement;
    event.preventDefault();

    return (
      this.resolveExact(token, htmlEl, event) ??
      this.resolvePrefixed(token, htmlEl) ??
      this.resolveCustom(token, htmlEl, event) ??
      this.resolveLiteral(token) ??
      token
    );
  }

/** Register a new exact token like "@foo" */
  public static registerCustomToken(
    name: string,
    resolver: (el: HTMLElement, ev: Event) => any
  ): void {
    this.customResolvers[name] = resolver;
  }

/** Register a new prefixed token like "@style:" */
  public static registerPrefixedToken(
    prefix: string,
    resolver: (suffix: string, el: HTMLElement) => any
  ): void {
    PREFIXED_TOKEN_RESOLVERS[prefix] = resolver;
  }

  private static resolveExact(token: string, el: HTMLElement, ev: Event): any | null {
    const resolver = EXACT_TOKEN_RESOLVERS[token];
    return resolver ? resolver(el, ev) : null;
  }

  private static resolvePrefixed(token: string, el: HTMLElement): any | null {
    for (const [prefix, resolver] of Object.entries(PREFIXED_TOKEN_RESOLVERS)) {
      if (token.startsWith(prefix)) {
        return resolver(token.slice(prefix.length), el);
      }
    }
    return null;
  }

  private static resolveCustom(token: string, el: HTMLElement, ev: Event): any | null {
    const resolver = this.customResolvers[token];
    return resolver ? resolver(el, ev) : null;
  }

  private static resolveLiteral(token: string): any | null {
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
}
