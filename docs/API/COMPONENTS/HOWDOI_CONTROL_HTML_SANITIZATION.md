# How do I control HTML sanitization?

Every component's rendered template is run through `SecurityHelper.sanitizeTemplate()` before being assigned to `innerHTML`. Set `trustLevel` once, via `super()`:

```ts
export class NoteComponent extends Component {
  constructor(mountTarget: HTMLElement, config: { html: string }) {
    // trust the rich-text HTML for this component's entire template
    super({ templateFn: () => `<div>${config.html}</div>`, mountTarget, trustLevel: 'trusted' });
  }
}
```

```ts
type TrustLevel = 'strict' | 'normal' | 'trusted'; // default: 'normal'
```

| Level | Behavior |
|---|---|
| `trusted` | No sanitization at all — the template string is used verbatim. |
| `normal` (default) | Strips `<script>` tags and any attribute whose name starts with `on` (`onclick`, `onerror`, ...). |
| `strict` | Everything `normal` does, plus strips `<iframe>`, `<object>`, `<embed>` tags, and removes `href`/`src`/`action`/`formaction`/`poster`/`background` attributes whose value is a `javascript:`/`data:` URL (including whitespace-obfuscated variants like `java\tscript:`). |

`trustLevel` is per-instance and applies to every render — there's no per-fragment "trust this bit only" option. If any part of a `'trusted'` component's template includes untrusted user data, that data is unsanitized.

## Manually escaping strings

`SecurityHelper.escapeHtml()` is available for escaping arbitrary values before interpolating them into a template string yourself:

```ts
import { SecurityHelper } from '../../../core/index.js';

const safeName = SecurityHelper.escapeHtml(userInput.name);
```

It returns `''` for `null`/`undefined` and stringifies other values first.

`escapeHtml` runs independently of `trustLevel` — it's a manual utility, not gated by the component's trust setting.

## Per-token escaping

Most exact [`data-event`](../EVENTS/HOWDOI_HANDLE_DOM_EVENTS.md) tokens (`@id`, `@class`, `@textContent`, ...) are escaped via plain `escapeHtml`. `@value` specifically routes through a variant aware of `<input>`/`<textarea>`/`contenteditable` elements, escaping their current value/`innerText`. 
This escaping is always on, regardless of the component's `trustLevel` — trust level only affects the template-string-to-`innerHTML` path, not `data-event`, `data-i18n`, or `data-pipe` output.
