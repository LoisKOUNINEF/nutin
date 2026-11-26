import * as SecurityHelper from './security.helper.js';

// Markup from html``: `value` is safe markup; `raws` maps a placeholder token to the
// unescaped source of a raw() that sits in element position, resolved as DOM nodes at render.
export class SafeHtml {
  constructor(
    public readonly value: string,
    public readonly raws: ReadonlyMap<string, string> = new Map()
  ) {}

  public toString(): string {
    // Fallback for String(): inline each raw with its bindings and clobbering names stripped.
    // The render path (sanitizeToFragment) resolves placeholders as nodes instead.
    let out = this.value;
    this.raws.forEach((source, token) => {
      // A replacer function: a string would expand `$&`, `$'`, ... found in the source.
      out = out.replace(SafeHtml.placeholder(token), () => SecurityHelper.stripRawMarkup(source));
    });
    return out;
  }

  public static placeholder(token: string): string {
    return `<template data-nutin-raw="${token}"></template>`;
  }
}

type Context = 'text' | 'tag' | 'attr-doublequoted' | 'attr-singlequoted' | 'attr-unquoted-start' | 'attr-unquoted' | 'rcdata';

// Elements whose content is text: markup in them is never parsed as elements.
const RCDATA_TAGS = new Set(['textarea', 'title']);

const BLOCKED_URL = 'about:invalid#nutin-blocked';

let rawCounter = 0;

// Tagged template: every ${} is HTML-escaped unless it is a SafeHtml (nested html``/raw()).
// Arrays are interpolated item by item, so `${items.map((i) => html`<li>${i}</li>`)}` needs no join.
// The parse context is tracked over the STATIC parts only, so interpolated data can't change it.
// `data-optional="${x}"` removes its element when x is null/undefined: DomHelper.cleanupOptionalContent
// looks for the literal strings, so they are kept there instead of rendering as ''.
const OPTIONAL_VALUE = /\sdata-optional=["']?$/;

export function html(strings: TemplateStringsArray, ...values: unknown[]): SafeHtml {
  const raws = new Map<string, string>();
  // The scan state lives in local variables, not an object: esbuild can shorten local names,
  // never property names (html`` runs on every render, so this is a hot, size-sensitive path).
  let ctx = 'text' as Context;
  let tagName = '';        // element of the current tag, lowercased; '/'-prefixed for a closing tag
  let inTagName = false;
  let attrName = '';       // last attribute name in the current tag, lowercased
  let newAttrName = false; // whitespace seen: the next name character starts a new attribute name
  let attrStatic = '';     // the current attribute value's static text
  let attrValue = '';      // the current attribute value so far, static text and interpolations
  let rcdataTail = '';     // last characters seen in rcdata, to find its end tag

  // Follows the HTML tokenizer closely enough to know where each ${} lands: text, inside a tag,
  // inside an attribute value (and which attribute), or inside a <textarea>/<title>.
  const scan = (chunk: string): void => {
    for (const ch of chunk) {
      switch (ctx) {
        case 'text':
          if (ch === '<') {
            ctx = 'tag';
            tagName = '';
            inTagName = true;
            attrName = '';
          }
          break;
        case 'tag':
          if (ch === '>') {
            ctx = RCDATA_TAGS.has(tagName) ? 'rcdata' : 'text';
            rcdataTail = '';
          } else if (ch === '=') {
            ctx = 'attr-unquoted-start';
            attrStatic = '';
            attrValue = '';
          } else if (/\s/.test(ch) || (ch === '/' && tagName !== '')) {
            inTagName = false;
            newAttrName = true;
          } else if (inTagName) {
            tagName += ch.toLowerCase();
          } else {
            attrName = newAttrName ? ch.toLowerCase() : attrName + ch.toLowerCase();
            newAttrName = false;
          }
          break;
        case 'attr-unquoted-start':
          if (ch === '"') ctx = 'attr-doublequoted';
          else if (ch === "'") ctx = 'attr-singlequoted';
          else if (ch === '>') ctx = 'text';
          else if (!/\s/.test(ch)) {
            ctx = 'attr-unquoted';
            addAttrChar(ch);
          }
          break;
        case 'attr-unquoted':
          if (ch === '>') ctx = 'text';
          else if (/\s/.test(ch)) {
            ctx = 'tag';
            newAttrName = true;
          } else addAttrChar(ch);
          break;
        case 'attr-doublequoted':
        case 'attr-singlequoted':
          if (ch === (ctx === 'attr-doublequoted' ? '"' : "'")) {
            ctx = 'tag';
            newAttrName = true;
          } else addAttrChar(ch);
          break;
        case 'rcdata': {
          // Ends at `</textarea` (or `</title`) followed by whitespace, `/` or `>`.
          const end = `</${tagName}`;
          rcdataTail = (rcdataTail + ch).slice(-(end.length + 1));
          if (rcdataTail.slice(0, -1).toLowerCase() === end && /[\s/>]/.test(ch)) {
            ctx = ch === '>' ? 'text' : 'tag';
            tagName = `/${tagName}`;
            inTagName = false;
          }
          break;
        }
      }
    }
  };

  const addAttrChar = (ch: string): void => {
    attrStatic += ch;
    attrValue += ch;
  };

  // Escaping can't make a URL safe: `javascript:alert(1)` has nothing to escape.
  // A value from data that turns a URL attribute into a javascript: URL is replaced, at every trust level
  // (the render sanitizer doesn't run at 'trusted'). A javascript: URL written in the template itself is kept.
  const checkUrl = (piece: string): string => {
    const value = attrValue + piece;
    if (SecurityHelper.isScriptUrl(attrName, value) && !SecurityHelper.isScriptUrl(attrName, attrStatic)) {
      console.warn(`Blocked a javascript: URL in the "${attrName}" attribute - validate URLs from data.`);
      piece = BLOCKED_URL;
    }
    attrValue += piece;
    return piece;
  };

  let out = strings[0] as string;
  scan(out);
  for (let i = 0; i < values.length; i++) {
    const value = values[i];
    const current = ctx;
    const inAttr = current.startsWith('attr');
    const fillsOptional = (value === null || value === undefined) && inAttr && OPTIONAL_VALUE.test(out);
    let piece = fillsOptional ? String(value) : interpolate(value, current, raws);
    if (inAttr) piece = checkUrl(piece);
    if (current === 'attr-unquoted-start') {
      // Unquoted attribute (`title=${x}`): quote the whole value so data can't add attributes.
      out += `"${piece.replace(/"/g, '&quot;')}"`;
      ctx = 'tag';
      newAttrName = true;
    } else if (current === 'attr-unquoted') {
      // Inside an unquoted value already started (`class=a${x}`): encode anything that would end it.
      out += piece.replace(/[\s"'`=<>]/g, (c) => `&#${c.charCodeAt(0)};`);
    } else {
      out += piece;
    }
    rcdataTail = '';
    const next = strings[i + 1] as string;
    out += next;
    scan(next);
  }
  return new SafeHtml(out, raws);
}


// Inserts markup unescaped, minus Nutin's binding attributes (data-event, data-component, ...),
// so it can't call the component's methods or mount children. Sanitized at the component's trustLevel.
// raw() is a SafeHtml whose keyed '', so a raw() from generateTemplate() renders like one between elements.
// Inside html`` its source is read back (see rawSource()) and placed by interpolateRaw().
export function raw(value: unknown): SafeHtml {
  return new SafeHtml(SafeHtml.placeholder(''), new Map([['', toMarkup(value)]]));
}

// Like raw(), but keeps binding attributes: only for markup you wrote or compiled yourself
// (e.g. Markdown pages whose links use data-event).
export function trustedRaw(value: unknown): SafeHtml {
  return new SafeHtml(toMarkup(value));
}

type Branch = Nutin.Template | (() => Nutin.Template);

const resolveBranch = (branch: Branch): Nutin.Template => (typeof branch === 'function' ? branch() : branch);

// nutinIf()/nutinFor()'s result: the taken branch (nutinFor: the items' templates),
// or '' when the condition is false and no nutinElse() follows.
// Inside html`` it is unwrapped (see isConditional()), so the branch gets exactly its inline treatment.
// Returned directly from generateTemplate() (or through String()), it renders as the branch itself would.
class ConditionalHtml extends SafeHtml {
  constructor(public readonly condition: boolean, public readonly result: Nutin.Template | Nutin.Template[]) {
    super('');
    // Its top-level value and raws are built on first read only:
    // inside html`` (the usual case) they never are, since the result is interpolated in place.
    // Built eagerly, a nutinFor's markup would be built once more for each level of nesting.
    // Own accessors: they replace the fields SafeHtml set.
    let built: [string, ReadonlyMap<string, string>] | undefined;
    const build = () => (built ??= topLevel(result));
    Object.defineProperties(this, {
      value: { get: () => build()[0] },
      raws: { get: () => build()[1] },
    });
  }

  // Returns itself when the condition holds: it renders exactly as its branch would,
  // inline and at the top level, where a bare nutinFor array would be stringified with commas.
  public nutinElse(branch: Branch): Nutin.Template {
    return this.condition ? this : resolveBranch(branch);
  }
}

// if/else in a template: `${nutinIf(user.isAdmin, () => html`<admin-panel>`).nutinElse('Read-only')}`.
// A branch can be a string, html``, raw(), trustedRaw()) or a thunk returning one:
// only the branch taken is called.
// The condition is a strict boolean (`count > 0`, not `count`).
export function nutinIf(condition: boolean, branch: Branch): ConditionalHtml {
  if (!globalThis.__NUTIN_PROD__ && typeof condition !== 'boolean') {
    console.warn(`nutinIf() expects a boolean condition, got ${typeof condition} - e.g. use count > 0, not count.`);
  }
  return new ConditionalHtml(condition, condition ? resolveBranch(branch) : '');
}

// A list of markup in a template, rendered as an array in a ${} hole would be:
// `${nutinFor(task.tags, (tag) => html`<li>${tag}</li>`).nutinElse(html`<li>No tags</li>`)}`.
// items: any iterable (Set, Map entries, generator, NodeList); null/undefined are empty.
// The else branch, rendered for an empty list, follows nutinIf's rules.
// For items with their own state or events, or kept across renders (keepBy), use a catalog.
export function nutinFor<T>(
  items: Iterable<T> | null | undefined,
  render: (item: T, index: number) => Nutin.Template
): ConditionalHtml {
  const list = toList(items);
  // The define folds this in prod bundles: only list.map(render) is left.
  return new ConditionalHtml(list.length > 0, list.map(globalThis.__NUTIN_PROD__ ? render : checkedRender(render)));
}

function toList<T>(items: Iterable<T> | null | undefined): T[] {
  if (items === null || items === undefined) return [];
  if (Array.isArray(items)) return items;
  // A string is iterable, but char by char is never what a template wants.
  if (typeof items !== 'string' && typeof (items as Partial<Iterable<T>>)[Symbol.iterator] === 'function') {
    return Array.from(items);
  }
  if (!globalThis.__NUTIN_PROD__) {
    console.warn(`nutinFor() expects an array or iterable, got ${typeof items} - it renders nothing.`);
  }
  return [];
}

// Dev only: a render callback that returns undefined (a forgotten `return`) renders nothing silently.
function checkedRender<T>(render: (item: T, index: number) => Nutin.Template) {
  let warned = false;
  return (item: T, index: number): Nutin.Template => {
    const out = render(item, index);
    if (out === undefined && !warned) {
      warned = true;
      console.warn(`nutinFor() render returned undefined for item ${index} - did it forget a return?`);
    }
    return out;
  };
}

// The value/raws a branch renders with at the top level:
// a string is markup, as a string returned from generateTemplate() is.
// Anything else that isn't a SafeHtml is coerced as it would be inside html``.
function topLevel(result: unknown): [string, ReadonlyMap<string, string>] {
  if (typeof result === 'string') return [result, new Map()];
  if (result instanceof SafeHtml) return [result.value, result.raws];
  const raws = new Map<string, string>();
  return [interpolate(result, 'text', raws), raws];
}

// Duck-typed rather than `instanceof ConditionalHtml`:
// interpolate() runs in every app.
// The check would keep the class (and nutinIf) in bundles that never call nutinIf.
function isConditional(value: unknown): value is ConditionalHtml {
  return value instanceof SafeHtml && 'nutinElse' in value;
}

// The source of a raw(), or undefined for any other value.
function rawSource(value: unknown): string | undefined {
  return value instanceof SafeHtml ? value.raws.get('') : undefined;
}

function toMarkup(value: unknown): string {
  return value === null || value === undefined ? '' : String(value);
}

function interpolate(value: unknown, ctx: Context, raws: Map<string, string>): string {
  if (ctx === 'rcdata') return interpolateText(value);
  if (isConditional(value)) return interpolate(value.result, ctx, raws);
  const source = rawSource(value);
  if (source !== undefined) return interpolateRaw(source, ctx, raws);
  if (value instanceof SafeHtml) {
    value.raws.forEach((source, token) => raws.set(token, source));
    return value.value;
  }
  if (Array.isArray(value)) return value.map((item) => interpolate(item, ctx, raws)).join('');
  if (value === null || value === undefined || value === false) return '';
  // In tag position (`<input ${x}>`) escaping alone leaves `name=value` intact, so data could
  // add attributes: it is filtered like raw() there (no handlers, bindings or script URLs).
  if (ctx === 'tag') return SecurityHelper.sanitizeAttributes(String(value));
  return SecurityHelper.escapeHtml(value);
}

// Inside <textarea>/<title> everything is text, so no placeholder could be resolved there.
// raw() is inserted as innerHTML would put it (entities decode, tags show as text) with `<` escaped,
// so it can't end the element. Nested html`` and trustedRaw() are kept as they are, as anywhere else.
function interpolateText(value: unknown): string {
  if (isConditional(value)) return interpolateText(value.result);
  const source = rawSource(value);
  if (source !== undefined) return rawAsText(source);
  if (value instanceof SafeHtml) {
    let out = value.value;
    value.raws.forEach((source, token) => {
      out = out.replace(SafeHtml.placeholder(token), () => rawAsText(source));
    });
    return out;
  }
  if (Array.isArray(value)) return value.map(interpolateText).join('');
  if (value === null || value === undefined || value === false) return '';
  return SecurityHelper.escapeHtml(value);
}

function rawAsText(source: string): string {
  return source.replace(/</g, '&lt;');
}

function interpolateRaw(source: string, ctx: Context, raws: Map<string, string>): string {
  // In element position raw() is resolved as nodes at render; elsewhere it is inlined safely now.
  if (ctx === 'text') {
    const token = `r${++rawCounter}`;
    raws.set(token, source);
    return SafeHtml.placeholder(token);
  }
  if (ctx === 'tag') return SecurityHelper.sanitizeAttributes(source);
  return SecurityHelper.escapeHtml(source);
}
