export class SecurityHelper {
  // Compared against localName, so SVG/MathML elements of the same name are caught too.
  // style/link restyle the whole page, base moves every relative URL, meta can refresh/navigate.
  private static readonly STRIPPED_TAGS = new Set(['script', 'style', 'link', 'base', 'meta']);
  private static readonly STRICT_STRIPPED_TAGS = new Set(['iframe', 'object', 'embed', 'frame']);

  // A data: document in a frame runs its own scripts (opaque origin): only allowed at 'trusted'.
  private static readonly FRAME_TAGS = new Set(['iframe', 'object', 'embed', 'frame']);
  private static readonly FRAME_URL_ATTRS = new Set(['src', 'data']);
  private static readonly URL_ATTRS = new Set([
    'href',
    'src',
    'action',
    'formaction',
    'poster',
    'background',
    'xlink:href',
  ]);

  // Attributes Nutin acts on after render: in injected markup they bind to the component's methods/children.
  private static readonly BINDING_ATTRS = [
    'data-event',
    'data-component',
    'data-catalog',
    'data-bind',
    'data-i18n',
    'data-pipe',
    'data-pipe-source',
  ];

  // SVG <animate>/<set> can rewrite an attribute after sanitization: drop those targeting a URL attribute.
  private static readonly ATTR_ANIMATION_TAGS = new Set(['animate', 'set']);

  // javascript: is stripped from 'normal' up; data: only under 'strict' (data: images are legitimate).
  private static readonly SCRIPT_URL_SCHEME = /^javascript:/i;
  private static readonly STRICT_URL_SCHEMES = /^(javascript|data):/i;

  // String form of sanitizeToFragment(). Rendering inserts the fragment instead: assigning
  // this string to innerHTML parses it a second time.
  public static sanitizeTemplate(value: unknown, trustLevel: TrustLevel = 'normal'): string {
    if (value === null || value === undefined) return '';
    if (trustLevel === 'trusted' && !this.rawsOf(value)) return String(value);

    const holder = document.createElement('template');
    holder.content.append(this.sanitizeToFragment(value, trustLevel));
    return holder.innerHTML;
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

  // Parses once and returns the sanitized nodes: inserting them directly means the browser never re-parses the
  // cleaned markup, which is where mutation XSS turns inert text back into elements.
  // A SafeHtml from html`` may carry raw() sources behind placeholders: each is parsed once,
  // in its real parent context, stripped of bindings and sanitized as nodes, then put in place.
  public static sanitizeToFragment(value: unknown, trustLevel: TrustLevel = 'normal'): DocumentFragment {
    const holder = document.createElement('template');
    const raws = this.rawsOf(value);
    holder.innerHTML = value === null || value === undefined ? '' : raws ? (value as { value: string }).value : String(value);
    if (trustLevel !== 'trusted') this.sanitizeNode(holder.content, trustLevel);
    if (raws) this.resolveRaws(holder.content, raws, trustLevel);
    return holder.content;
  }

  // raw() in attribute position (`<a ${raw('aria-current="page"')}>`): rebuilt from the parsed
  // attributes, minus event handlers, srcdoc, bindings and script URLs.
  public static sanitizeAttributes(source: string): string {
    const holder = document.createElement('template');
    holder.innerHTML = `<span ${source}></span>`;
    // An unterminated quote makes the parser drop the whole tag: nothing to keep.
    const el = holder.content.firstElementChild;
    if (!el) return '';
    return Array.from(el.attributes)
      .filter((attr) => this.isAllowedRawAttribute(attr.name.toLowerCase(), attr.value))
      .map((attr) => `${attr.name}="${this.escapeHtml(attr.value)}"`)
      .join(' ');
  }

  public static stripBindings(markup: string): string {
    const holder = document.createElement('template');
    holder.innerHTML = markup;
    this.stripBindingsFrom(holder.content);
    return holder.innerHTML;
  }

  private static stripBindingsFrom(root: ParentNode): void {
    const selector = this.BINDING_ATTRS.map((attr) => `[${attr}]`).join(',');
    root.querySelectorAll(selector).forEach((el) => {
      this.BINDING_ATTRS.forEach((attr) => el.removeAttribute(attr));
    });
    root.querySelectorAll('template').forEach((el) => {
      const content = this.templateContent(el);
      if (content) this.stripBindingsFrom(content);
    });
  }

  private static rawsOf(value: unknown): ReadonlyMap<string, string> | null {
    const raws = (value as { raws?: unknown } | null)?.raws;
    return raws instanceof Map ? raws : null;
  }

  private static resolveRaws(root: ParentNode, raws: ReadonlyMap<string, string>, trustLevel: TrustLevel): void {
    // Snapshot first: content put in place is never searched for placeholders again.
    for (const placeholder of this.collectPlaceholders(root)) {
      const source = raws.get(placeholder.getAttribute('data-nutin-raw') ?? '');
      const parsed = this.parseInContext(source ?? '', placeholder.parentNode);
      if (trustLevel !== 'trusted') this.sanitizeNode(parsed, trustLevel);
      this.stripBindingsFrom(parsed);
      placeholder.replaceWith(...Array.from(parsed.childNodes));
    }
  }

  private static collectPlaceholders(root: ParentNode): Element[] {
    const found: Element[] = [];
    root.querySelectorAll('template').forEach((el) => {
      if (el.hasAttribute('data-nutin-raw')) found.push(el);
      const content = this.templateContent(el);
      if (content) found.push(...this.collectPlaceholders(content));
    });
    return found;
  }

  // Parses inside the inert document behind <template> (nothing loads or runs there), using an
  // element like the placeholder's parent as context so <svg>/<math>/<table> content parses as
  // it will once inserted.
  private static parseInContext(source: string, parent: Node | null): ParentNode {
    const holder = document.createElement('template');
    const parentEl = parent && parent.nodeType === 1 ? (parent as Element) : null;
    if (parentEl && !this.templateContent(parentEl)) {
      const context = holder.content.ownerDocument.createElementNS(parentEl.namespaceURI, parentEl.localName);
      context.innerHTML = source;
      return context;
    }
    holder.innerHTML = source;
    return holder.content;
  }

  private static isAllowedRawAttribute(name: string, value: string): boolean {
    if (!/^[a-z_:][-a-z0-9_:.]*$/.test(name)) return false;
    if (name.startsWith('on') || name === 'srcdoc' || this.BINDING_ATTRS.includes(name)) return false;
    return !(this.URL_ATTRS.has(name) && this.isDangerousUrl(value, 'normal'));
  }

  // Only an HTML <template> has a content fragment; <svg><template> is a plain element.
  private static templateContent(el: Element): DocumentFragment | null {
    const content = (el as HTMLTemplateElement).content;
    return content && typeof content.querySelectorAll === 'function' ? content : null;
  }

  private static sanitizeNode(root: ParentNode, trustLevel: TrustLevel): void {
    // Snapshot children before mutating — removing an element from a live
    // collection while iterating it would skip its next sibling.
    const children = Array.from(root.children);

    for (const el of children) {
      const tag = el.localName.toLowerCase();

      if (this.STRIPPED_TAGS.has(tag)) {
        el.remove();
        continue;
      }
      if (trustLevel === 'strict' && this.STRICT_STRIPPED_TAGS.has(tag)) {
        el.remove();
        continue;
      }
      if (this.animatesUrlAttribute(el)) {
        el.remove();
        continue;
      }

      for (const attr of Array.from(el.attributes)) {
        const name = attr.name.toLowerCase();
        // srcdoc is parsed as a same-origin document: escaped markup in it is decoded and runs.
        if (name.startsWith('on') || name === 'srcdoc') {
          el.removeAttribute(attr.name);
          continue;
        }
        if (this.URL_ATTRS.has(name) && this.isDangerousUrl(attr.value, trustLevel)) {
          el.removeAttribute(attr.name);
          continue;
        }
        if (this.FRAME_TAGS.has(tag) && this.FRAME_URL_ATTRS.has(name) && this.isDangerousUrl(attr.value, 'strict')) {
          el.removeAttribute(attr.name);
        }
      }

      this.sanitizeNode(this.templateContent(el) ?? el, trustLevel);
    }
  }

  private static animatesUrlAttribute(el: Element): boolean {
    if (!this.ATTR_ANIMATION_TAGS.has(el.localName.toLowerCase())) return false;
    const target = (el.getAttribute('attributeName') ?? '').trim().toLowerCase();
    return this.URL_ATTRS.has(target) || this.URL_ATTRS.has(target.replace(/^xlink:/, ''));
  }

  private static isDangerousUrl(value: string, trustLevel: TrustLevel): boolean {
    // Browsers strip ASCII tab/newline/CR from a URL (and trim leading C0
    // control/space) before scheme-sniffing, so "java\tscript:" still runs
    // as javascript: — normalize the same way before checking the scheme.
    const normalized = value.replace(/[\t\n\r]/g, '').replace(/^[\x00-\x20]+/, '');
    const schemes = trustLevel === 'strict' ? this.STRICT_URL_SCHEMES : this.SCRIPT_URL_SCHEME;
    return schemes.test(normalized);
  }
}
