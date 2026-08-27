# How do I create a view?

A view is a routed page — one per route, mounted and destroyed by the [router](./HOWDOI_REGISTER_A_ROUTE.md).

```ts
// home.view.ts
import { View, ComponentConfig } from '../../../core/index.js';

const template = `<h1 data-i18n="home.title"></h1>`;

export class HomeView extends View {
  constructor() {
    super({ template });
  }

  public registerChildren(): ComponentConfig[] {
    return []; // mount child components the same way as any other component — see the Components docs
  }
}
```

```ts
export const appRoutes: Routes = {
  '/': () => new HomeView(),
};
```

## `View` vs. `Component`

`View` is for full-page routes; [`Component`](../COMPONENTS/HOWDOI_CREATE_A_COMPONENT.md) is for reusable, non-routed UI. The key differences:

- `View` takes a plain `template: string` — no `templateFn`/`config` normalization layer.
- Defaults differ: `tagName: 'section'`, `mountTarget: '#app'` (vs. `Component`'s `tagName: 'div'`).
- `View` tracks route params and adds router-only hooks `onEnter()`/`onExit()` — see [How do I access route parameters?](./HOWDOI_ACCESS_ROUTE_PARAMS.md) and [What lifecycle hooks are available?](../LIFECYCLE_HOOKS/WHAT_LIFECYCLE_HOOKS_ARE_AVAILABLE.md).
- Views are constructed via a factory function referenced from the route table, not instantiated directly by application code the way components are.

## `viewName`

```ts
interface ViewOptions {
  template?: string;
  mountTarget?: string | HTMLElement; // default: '#app'
  tagName?: keyof HTMLElementTagNameMap; // default: 'section'
  viewName?: string;
  trustLevel?: 'strict' | 'normal' | 'trusted';
}
```

`viewName` (minus `View` suffix) is what's emitted in the `view-mount`/`view-unmount` events fired by the router; see [How do I listen to application events?](../APP_EVENTS/HOWDOI_LISTEN_TO_APPLICATION_EVENTS.md).
