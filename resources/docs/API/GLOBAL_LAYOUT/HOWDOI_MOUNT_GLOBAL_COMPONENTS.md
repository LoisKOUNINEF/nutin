# How do I mount global components?

```ts
// main.ts
import { registerGlobals } from '../core/index.js';
import { NavbarComponent } from './components/globals/navbar/navbar.component.js';
import { FooterComponent } from './components/globals/footer/footer.component.js';

registerGlobals({
  before: [{ component: NavbarComponent, id: 'navbar' }],
  after: [{ component: FooterComponent, id: 'footer' }],
});
```

```ts
interface GlobalConfig {
  component: new (mountTarget: HTMLElement) => Component; // constructed internally — you never pass mountTarget
  id: string;                                              // stamped onto the rendered root element
}

registerGlobals(options: { before?: GlobalConfig[]; after?: GlobalConfig[] }): void
```

Call this once in `main.ts`, alongside `registerPipes()`/`AppRouter(routes)`. Each entry's `component` is constructed and rendered internally, its root element's `id` is set to the entry's `id`, and:

- `before` entries are **prepended** to `<body>`, in the given order.
- `after` entries are **appended** to `<body>`, in the given order.

This mounts them as **siblings of `<main id="app">`**, not inside it — global components persist across every route change, unaffected by the router swapping views.

## Duplicate ids

Registering an `id` that's already registered logs `console.warn('Global "${id}" is already registered - skipping.')` and skips that entry entirely — the earlier-mounted element for that id is left in place, nothing is replaced.

Use `hideGlobals`/`revealGlobals` to toggle visibility of already-mounted globals from anywhere in the app — see [How do I toggle global components?](./HOWDOI_TOGGLE_GLOBAL_COMPONENTS.md).
