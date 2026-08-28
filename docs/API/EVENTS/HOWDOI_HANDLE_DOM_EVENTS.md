# How do I handle DOM events?

## `data-event`

```html
<button data-event="click:_handleDelete:@dataset:id,@target">Delete</button>
<input data-event="input:_handleName:@value">
```

```
data-event="eventName:handlerMethodName[:arg1,arg2,...]"
```

`eventName` is bound via `addEventListener` to `this[handlerMethodName](...resolvedArgs)`. Listeners are rebound (old ones torn down first) on every render, and fully removed on `destroy()`. If `eventName`, `handlerMethodName`, or a matching method on the component is missing, the attribute is silently ignored — no error.

## Resolving arguments

Each `:`-separated arg after the handler name is resolved per-token:

| Token | Resolves to |
|---|---|
| `@id` / `@class` / `@name` / `@tag` | the matching element property, HTML-escaped |
| `@value` | the input/textarea `.value`, or a `contenteditable` element's `.innerText`, escaped |
| `@checked` / `@selected` | raw boolean, unescaped |
| `@textContent` / `@innerText` / `@html` | the matching element property, escaped |
| `@event` | the raw `Event` object |
| `@target` | `event.target` |
| `@x` / `@y` | `event.clientX` / `event.clientY` (defaulting to `0`) |
| `@key` / `@code` | `event.key` / `event.code`, escaped |
| `@attr:name` | `element.getAttribute('name')`, escaped |
| `@dataset:key` | `element.dataset['key']`, escaped |
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

## Gotchas

- Resolving **any** arg token calls `event.preventDefault()` unconditionally — so a `data-event` handler with at least one argument always prevents default browser behavior (form submission, link navigation, etc.). A handler with **zero** args (`data-event="click:handler"`) does **not** prevent default.
- `@checked`, `@selected`, `@event`, `@target`, `@x`, `@y` are the only tokens that are *not* HTML-escaped — they return raw booleans/objects/numbers, not strings.
