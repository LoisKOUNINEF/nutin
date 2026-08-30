# How do I hide global components?

```ts
import { hideGlobals, revealGlobals } from '../../../core/index.js';

hideGlobals(['navbar']);
revealGlobals(['navbar']);
```

```ts
hideGlobals(globalIds: string[]): void
revealGlobals(globalIds: string[]): void
```

Both look up `document.getElementById(id)` for each given id — the same `id` you passed to [`registerGlobals`](./HOWDOI_MOUNT_GLOBAL_COMPONENTS.md) — and toggle only `element.style.display`: `hideGlobals` sets `'none'`, `revealGlobals` sets `'block'`. Other inline styles are untouched, and a missing id is silently ignored (no throw, no warning).

Can be called from anywhere — a route guard, a button handler in any component or view — since both go through the `Globals` singleton internally.

## Gotcha

`revealGlobals` always sets `display: 'block'`. If the element's natural display was something else (`flex`, `grid`, `inline-block`, ...), revealing it forces `block` rather than restoring the original value.
