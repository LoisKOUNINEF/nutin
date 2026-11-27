# How do I use `nutinIf`, `nutinFor` and `nutinElse`?

## `nutinIf`

For markup that only branches, `nutinIf()` keeps the if/else in the template itself, `.html` files included, with no override:

```ts
import { html, nutinIf } from '../../../core/index.js';

const templateFn = (config: AvatarConfig) => html`
  ${nutinIf(Boolean(config.src), () => html`<img class="avatar__img" src="${config.src}" alt="${config.alt}">`)
    .nutinElse(html`<span class="avatar__initials" aria-hidden="true">${config.initials}</span>`)}
`;
```

- A branch is a plain string, an `html` result, `raw()`, `trustedRaw()`, or a thunk returning one. It behaves exactly as if written in place of the call: a plain string is escaped inside `html`, but is markup when `nutinIf` is returned directly from `generateTemplate()`.
- Only the branch taken is called and rendered: pass a thunk (`() => html`) for a branch that is costly to build or reads data that may be missing. The untaken branch's `data-component` children are never mounted.
- The condition must be a `boolean`: write `count > 0`, not `count` (with `&&`, ``${count && html`…`}`` renders `0`). A non-boolean condition warns in development.
- In a component whose template is a `.html` file, keep the `nutinIf` import in its code file even though the editor reports it as unused.

### What `nutinIf` adds over a ternary

Gains:

- readable in long markup
- the strict boolean
- one documented if/else idiom
- lazy branches

Costs:

- an allocation per call
- the `.nutinElse` property name can't be shortened (about 10 B per use)

### data-optional or nutinIf?

- **[`data-optional`](./HOWDOI_REMOVE_EMPTY_ELEMENTS.md)** is for emptiness that is only known *after hydration*: text produced by `data-i18n`/`data-pipe`, an `<input>`'s resulting value, an `<img>` whose `src` ends up empty. The element is rendered, its children are mounted, then it's removed if empty.
- **`nutinIf`** is for a decision made from data before render: either/or markup, a boolean flag, which child placeholder to render. The untaken branch is never rendered, so the children in it never mount.

```html
<!-- Decided from data: nutinIf -->
${nutinIf(user.isAdmin, () => html`<div data-component="admin-panel"></div>`).nutinElse(html`<p>Read-only</p>`)}

<!-- Only empty once translated: data-optional -->
<p data-optional data-i18n="promo-banner"></p>
```

### Limitation

`nutinIf` can't narrow types, because its condition is just an argument, so you'll need `button!.label` even right after `button !== undefined`.

## `nutinFor`

For lists, `nutinFor()` maps items to markup, with the same [`.nutinElse()`](#nutinelse) for the empty state:

```html
<ul class="tags">
  ${nutinFor(task.tags, (tag) => html`
    <li><button data-event="click:_filter:@dataset:tag" data-tag="${tag}">${tag}</button></li>
  `).nutinElse(html`<li class="tags__none">No tags</li>`)}
</ul>

<select>${nutinFor(countries, (c) => html`<option value="${c.code}">${c.name}</option>`)}</select>
```

- `items` is any iterable: an array, a `Set`, a `Map` (its `[key, value]` entries), a generator, a `NodeList`. `null` and `undefined` are empty lists. Anything else, a string included, warns in development and renders nothing.
- Each item renders exactly as an element of an array in a `${}` would: a plain string is escaped, `html`/`raw()`/`trustedRaw()`/`nutinIf` keep their rules. This holds when `nutinFor` is returned directly from `generateTemplate()` too.
- The markup is exactly what you write, with no wrappers, so `<option>`s, table rows and `<dt>`/`<dd>` pairs work as they are.
- `data-event` in items binds to the component's own handlers. Pass the item's id with `@dataset:` (`data-id="${item.id}"` + `click:_pick:@dataset:id`).
- The items are rebuilt on every render. For items with their own state, or that must survive a re-render, use a catalog: see [Catalog or nutinFor?](./HOWDOI_REGISTER_CHILD_COMPONENTS.md#catalog-or-nutinfor).
- Each item's markup is built once, nested `nutinFor`s included: the top-level markup of a `nutinIf`/`nutinFor` is only built when it's returned directly from `generateTemplate()`.

### What `nutinFor` adds over `.map()`

The same kind of gains as nutinIf over a ternary:

- The empty branch, in the same vocabulary as nutinIf.
- Any iterable, and nullish values: `Set`, `Map` (entries), generators, `NodeList`, and `null`/`undefined` taken as empty.
- Readable in `.html`-backed templates, where long `.map(…)` chains with ternaries are the worst part of the markup
- One documented list idiom next to nutinIf.

Costs:

- an allocation per call, as with nutinIf
- about 40 B gzip when used, none when unused

## `nutinElse`

`.nutinElse(branch)` follows `nutinIf()` or `nutinFor()`. It renders `branch` when the condition is false or the list is empty:

- It's optional: without it, a false condition or an empty list renders nothing.
- Its branch follows the same rules as a `nutinIf` branch: a plain string, `html`, `raw()`, `trustedRaw()`, or a thunk returning one. The thunk is called only when the else is taken.
- It ends the chain: its result is the template to render, so **don't chain anything after it**.
- Else-if: pass a thunk that returns another `nutinIf`, `nutinIf(a, x).nutinElse(() => nutinIf(b, y).nutinElse(z))`.

### Why no `.nutinElseIf()`?

 1. Conditions are evaluated eagerly.
    - Arguments are evaluated before the call, so `b` is computed even when `a` is true. In the nested thunk, `b` is only computed when `a` is false.
    - nutinIf(!user, …).nutinElseIf(user.isAdmin, …) throws when user is null. The thunk form doesn't.
 2. Bundle size
    - The size is paid by every app that uses nutinIf or nutinFor, whether or not it calls else-if (apps that use neither pay nothing).
    - There's an extra cost per use, like `nutinElse`.
 3. It shows up on nutinFor results too.
    - `nutinFor(items, …).nutinElseIf(cond, …)` would mean "empty list and cond": valid but odd.
 4. It covers limited use cases.
 5. Maintenance: less is more.

## See also

- [How do I generate a template?](./HOWDOI_GENERATE_A_TEMPLATE.md)
- [How do I remove empty elements?](./HOWDOI_REMOVE_EMPTY_ELEMENTS.md)
- [How do I register child components?](./HOWDOI_REGISTER_CHILD_COMPONENTS.md)
- [How do I control HTML sanitization?](./HOWDOI_CONTROL_HTML_SANITIZATION.md)
