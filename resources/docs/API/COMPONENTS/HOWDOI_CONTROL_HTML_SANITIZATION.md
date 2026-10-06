# How do I control HTML sanitization?

## Escaping with `html`

Write templates with the `html` tag. Every `${}` in an `html` template is HTML-escaped, wherever the value comes from (an input, an HTTP response, localStorage, the server):

```ts
import { Component, html } from '../../../core/index.js';

const templateFn = (task: ITask) => html`<li title="${task.name}">${task.name}</li>`;
```

A task named `<button data-event="click:_remove">x</button>` renders as that text, not as a button.

- Nested `html` results are inserted as-is, so templates can be built from helper functions that return `html`.
- Arrays are inserted item by item. Map to `html` results and leave out `.join('')`:

```ts
const templateFn = (tasks: ITask[]) => html`<ul>${tasks.map((task) => html`<li>${task.name}</li>`)}</ul>`;
```

- `null`, `undefined` and `false` render as nothing, so `${done && html`<span>Done</span>`}` works.
- An unquoted attribute value is quoted for you: `html`<div title=${x}>`` renders `title="…"`, so a value with spaces can't add attributes. Quote your attributes anyway.
- `raw()` inserts markup unescaped, e.g. rich text from a CMS. At render it's parsed where it sits (inside `<svg>`, `<table>`, … too), Nutin's binding attributes (`data-event`, `data-component`, `data-catalog`, `data-bind`, `data-i18n`, `data-pipe`, `data-pipe-source`) are removed from it, and it's sanitized at the component's `trustLevel` (below). So the markup can't call your component's methods or mount children:

```ts
const templateFn = (post: IPost) => html`<article>${raw(post.bodyHtml)}</article>`;
```

- `trustedRaw()` inserts markup as-is, binding attributes included. Use it only for markup you wrote or compiled yourself, e.g. Markdown pages whose internal links use `data-event`:

```ts
const templateFn = (page: IPage) => html`<article>${trustedRaw(page.html)}</article>`;
```

Where `raw()` sits decides how it's handled:

- Between elements: complete markup, as above. Half an element (an unclosed `<div>`) gets closed by the parser.
- Inside a tag (`<input ${raw('checked')}>`): attributes only. Event handlers, `srcdoc`, binding attributes and `javascript:` URLs are dropped.
- Inside an attribute value: escaped like any other value.
- Inside `<textarea>` or `<title>`, which only hold text: inserted as text, the way `innerHTML` would put it there. Entities are decoded and tags show as written, and `raw('</textarea>…')` can't close the element.

An untagged template literal escapes nothing. The build warns about every untagged `template`/`templateFn` that contains `${}`.

## Trust levels

Every component's rendered template is also sanitized before it's inserted. It's parsed once and the sanitized nodes are inserted as they are, never turned back into a string and parsed again (that second parse is what mutation XSS relies on). It's a second layer, mainly for `raw()` content. Set `trustLevel` once, via `super()`:

```ts
export class NoteComponent extends Component {
  constructor(mountTarget: HTMLElement, config: { html: string }) {
    // trust the rich-text HTML for this component's entire template
    super({ templateFn: () => html`<div>${raw(config.html)}</div>`, mountTarget, trustLevel: 'trusted' });
  }
}
```

```ts
type TrustLevel = 'strict' | 'normal' | 'trusted'; // default: 'normal'
```

| Level | Behavior |
|---|---|
| `trusted` | No sanitization: the markup is used as written. `raw()` still removes binding attributes. |
| `normal` | Default. Strips `<script>`, `<style>`, `<link>`, `<base>` and `<meta>` elements (HTML, SVG and MathML alike), any attribute whose name starts with `on` (`onclick`, `onerror`, ...), `srcdoc` attributes, SVG `<animate>`/`<set>` elements that rewrite one of the URL attributes below, and `href`/`src`/`action`/`formaction`/`poster`/`background`/`xlink:href` attributes whose value is a `javascript:` URL (including whitespace-obfuscated variants like `java\tscript:`). Also removes `data:` and `javascript:` documents from `<iframe>`/`<object>`/`<embed>` (`src`/`data`). |
| `strict` | Everything `normal` does, plus strips `<iframe>`, `<object>`, `<embed>` tags, and also removes `data:` URLs from the URL attributes. |

`trustLevel` is per-instance and applies to every render. It's a blocklist, so it can't catch everything. It also keeps `data-event` and the other binding attributes, because your own template needs them. Never rely on it alone for untrusted data: escape with `html`, or use `raw()` for HTML.

Escaping can't help with a URL: in `html`<a href="${link}">``, a `link` of `javascript:…` contains nothing to escape. So `html` checks values in `href`, `src`, `action`, `formaction`, `poster`, `background` and `xlink:href` itself, at every trust level: a value that makes the attribute a `javascript:` URL is replaced with `about:invalid#nutin-blocked`, and a warning is logged in development. A URL whose scheme is written in the template (`href="/users/${id}"`, `href="https://…/${path}"`) is left alone. Other schemes are still up to you: `data:` URLs are only removed at `strict`.

At `trusted`, data inside an event handler or `srcdoc` attribute runs as code: in `onclick="go('${x}')"`, the escaped quotes in `x` are decoded before the script runs. Use `data-event` with a token instead (below).

## Data in `data-event` and `style`

Escaping keeps data inside the attribute, but these attributes give meaning to its content:

- `data-event` arguments are split on `,` and `@tokens` are resolved, so `data-event="click:_select:${item.id}"` with an id like `1,@target` passes extra arguments. Put the value in its own attribute and read it with a token: `data-id="${item.id}" data-event="click:_select:@dataset:id"`.
- `style="color:${color}"` lets the value add other declarations (`red;background-image:url(…)`). Validate it, or pick from a fixed list of classes instead.

## Escaping outside templates

`SecurityHelper.escapeHtml()` escapes a single value, e.g. for a string you build outside an `html` template:

```ts
import { SecurityHelper } from '../../../core/index.js';

const safeName = SecurityHelper.escapeHtml(userInput.name);
```

It returns `''` for `null`/`undefined` and stringifies other values first. Don't pass its result into an `html` template: it would be escaped twice.

## Token values are raw

[`data-event`](../EVENTS/HOWDOI_HANDLE_DOM_EVENTS.md) tokens (`@value`, `@textContent`, `@attr:name`, ...) and `getValues()` pass raw values to your handlers: typing `a & b` gives `a & b`. They're escaped when you render them through an `html` template.
