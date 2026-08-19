export type TrustLevel = 'strict' | 'normal' | 'trusted';

export class SecurityHelper {
  private static readonly STRICT_STRIPPED_TAGS = new Set(['IFRAME', 'OBJECT', 'EMBED']);
  private static readonly URL_ATTRS = new Set([
    'href',
    'src',
    'action',
    'formaction',
    'poster',
    'background',
  ]);
  private static readonly DANGEROUS_URL_SCHEMES = /^(javascript|data):/i;

  public static sanitizeTemplate(value: unknown, trustLevel: TrustLevel = 'normal'): string {
    if (value === null || value === undefined) return '';
    let template = String(value);

    return this.sanitizeInputTemplate(template, trustLevel);
  }

  public static sanitizeInputElement(
    el: HTMLInputElement | HTMLTextAreaElement | HTMLElement
  ): string {
    if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) {
      return SecurityHelper.escapeHtml(el.value);
    }
    if (el.hasAttribute('contenteditable')) {
      return SecurityHelper.escapeHtml(el.innerText);
    }
    return '';
  }

  public static escapeHtml(value: unknown): string {
    if (value === null || value === undefined) return '';

    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  private static sanitizeInputTemplate(template: string, trustLevel: TrustLevel): string {
    // Trusted: no template sanitization
    if (trustLevel === 'trusted') {
      return template;
    }

    const holder = document.createElement('template');
    holder.innerHTML = template;
    this.sanitizeNode(holder.content, trustLevel);

    return holder.innerHTML;
  }

  private static sanitizeNode(root: ParentNode, trustLevel: TrustLevel): void {
    // Snapshot children before mutating — removing an element from a live
    // collection while iterating it would skip its next sibling.
    const children = Array.from(root.children);

    for (const el of children) {
      const tag = el.tagName;

      if (tag === 'SCRIPT') {
        el.remove();
        continue;
      }
      if (trustLevel === 'strict' && this.STRICT_STRIPPED_TAGS.has(tag)) {
        el.remove();
        continue;
      }

      for (const attr of Array.from(el.attributes)) {
        const name = attr.name.toLowerCase();
        if (name.startsWith('on')) {
          el.removeAttribute(attr.name);
          continue;
        }
        if (trustLevel === 'strict' && this.URL_ATTRS.has(name) && this.isDangerousUrl(attr.value)) {
          el.removeAttribute(attr.name);
        }
      }

      if (tag === 'TEMPLATE') {
        this.sanitizeNode((el as HTMLTemplateElement).content, trustLevel);
      } else {
        this.sanitizeNode(el, trustLevel);
      }
    }
  }

  private static isDangerousUrl(value: string): boolean {
    // Browsers strip ASCII tab/newline/CR from a URL (and trim leading C0
    // control/space) before scheme-sniffing, so "java\tscript:" still runs
    // as javascript: — normalize the same way before checking the scheme.
    const normalized = value.replace(/[\t\n\r]/g, '').replace(/^[\x00-\x20]+/, '');
    return this.DANGEROUS_URL_SCHEMES.test(normalized);
  }
}
