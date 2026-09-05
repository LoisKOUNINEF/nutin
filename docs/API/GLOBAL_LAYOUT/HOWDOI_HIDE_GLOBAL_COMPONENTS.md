# How do I hide global components?

```ts
import { hideGlobals, revealGlobals } from '../../../core/index.js';

hideGlobals(['navbar']);
revealGlobals(['navbar']);
```

```ts
hideGlobals(globalIds: string[]): void
revealGlobals(globalIds: string[], display?: string): void
```

Both look up `document.getElementById(id)` for each given id — the same `id` you passed to [`registerGlobals`](./HOWDOI_MOUNT_GLOBAL_COMPONENTS.md) — and toggle only `element.style.display`. `hideGlobals` sets `'none'`, capturing the element's display value beforehand (its inline `style.display`, or the computed value if none was set) the first time that id is hidden. `revealGlobals` restores that captured value by default — pass `display` to override it with something else instead. Other inline styles are untouched, and a missing id is silently ignored (no throw, no warning).

Can be called from anywhere — a route guard, a button handler in any component or view — since both go through the `Globals` singleton internally.
