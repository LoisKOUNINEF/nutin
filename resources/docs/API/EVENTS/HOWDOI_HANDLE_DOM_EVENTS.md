# How do I handle DOM events?

## `data-event`

```html
<button data-event="click:_handleDelete:@dataset:id,@target">Delete</button>
<input data-event="input:_handleName:@value">
```

```
data-event="eventName:handlerMethodName[:arg1,arg2,...]"
```

`eventName` is bound via `addEventListener` to `this[handlerMethodName](...resolvedArgs)`. Listeners are rebound (old ones torn down first) on every render, and fully removed on `destroy()`. If `eventName` or `handlerMethodName` is empty, the attribute is ignored.

A handler name the component doesn't have is caught twice:

- **At build time (TypeScript):** the build checks every handler named in a component's or view's template against its class, so `data-event="click:_svae"` fails `tsc` at the template's line (`Property '_svae' does not exist … Did you mean '_save'?`). The same check makes template-only handlers count as used, so `noUnusedLocals` doesn't flag them. A handler inherited from a parent class must be `protected`, not `private`. Values built with `${}` aren't checked.
- **At runtime:** the attribute binds nothing and a `console.warn` names the component and the missing method (dropped from production builds, like every `console` call). This is the only check in JavaScript projects.

## Resolving arguments

Each comma-separated arg after the handler name is resolved per-token. A comma inside a quoted literal (`'a,b'`) doesn't split it:

| Token | Resolves to |
|---|---|
| `@id` / `@class` / `@name` / `@tag` | the matching element property |
| `@value` | the input/textarea `.value`, or a `contenteditable` element's `.innerText` |
| `@checked` / `@selected` | boolean |
| `@textContent` / `@innerText` / `@html` | the matching element property |
| `@event` | the raw `Event` object |
| `@target` | `event.target` |
| `@x` / `@y` | `event.clientX` / `event.clientY` (defaulting to `0`) |
| `@key` / `@code` | `event.key` / `event.code` |
| `@attr:name` | `element.getAttribute('name')` |
| `@dataset:key` | `element.dataset['key']` |
| `"literal"` / `'literal'` | the literal string, unquoted |
| `42` | the literal number |

Anything else falls back to the raw token text unless a custom token has been registered for it (see below).

```html
<button data-event="click:_addToCart:42,&quot;gift&quot;">Add</button>
```

## Custom tokens

`TokenHelper` is exported from `core/index.ts`:

```ts
import { TokenHelper } from '../../../core/index.js';

TokenHelper.registerCustomToken('@timestamp', () => Date.now());
TokenHelper.registerPrefixedToken('@style:', (prop, el) => (el.style as any)[prop] ?? '');
```

- `registerCustomToken(name, resolver)` — for a fixed token with no variable part, e.g. `@timestamp`.
- `registerPrefixedToken(prefix, resolver)` — for a repeatable pattern with a dynamic suffix, e.g. `@style:color`, `@style:width`.

A prefixed token used alone as a `data-event` arg (e.g. `data-event="click:_handler:@style:color"`) resolves correctly — the parser rejoins everything after the handler name on `:` before splitting on `,`. Only combining a prefixed token with a comma-separated sibling arg introduces ambiguity worth avoiding; if unsure, test the resolved value directly with `TokenHelper.resolve(token, el, event)`.

## Important

- A `data-event` handler only cancels the defaults that would leave the page: a click on an `<a href>`, a `submit`, and a click on a submit button inside a form — with or without args. Every other default (typing, checking a box, …) is kept; pass `@event` and call `preventDefault()` yourself to cancel one.
- A ctrl/meta/shift/alt or non-primary click on an `<a href>` skips the handler, so the browser can open the link in a new tab or window.
- A component only binds its own `data-event` elements: those inside a nested child component are bound by that child, to its own methods.
- Token values are raw, not HTML-escaped (`a & b` stays `a & b`). They're escaped when rendered through an [`html` template](../COMPONENTS/HOWDOI_CONTROL_HTML_SANITIZATION.md). `@checked`, `@selected`, `@event`, `@target`, `@x`, `@y` return booleans/objects/numbers, not strings.
