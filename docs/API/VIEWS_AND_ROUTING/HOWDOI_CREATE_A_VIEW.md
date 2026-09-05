# How do I create a view?

A view is a routed page — one per route, mounted and destroyed by the [router](./HOWDOI_REGISTER_A_ROUTE.md).

## Generate a view

```bash
npm run generate view foo # target directory: src/app/views/foo
```

## Register children

See [How do I register child components](../COMPONENTS/HOWDOI_REGISTER_CHILD_COMPONENTS.md)

```ts
// foo.view.ts
import { View, ComponentConfig } from '../../../core/index.js';

const template = `<h1>Title</h1>`;

export class FooView extends View {
  constructor() {
    super({ template, viewName: 'foo' });
  }

  public registerChildren(): ComponentConfig[] {
    return []; // mount child components the same way as any other component — see the Components docs
  }
}
```

```ts
export const appRoutes: Routes = {
  '/foo': () => new FooView(),
};
```

## `View` vs. `Component`

`View` is for full-page routes; [`Component`](../COMPONENTS/HOWDOI_CREATE_A_COMPONENT.md) is for reusable, non-routed UI. The key differences:

- `View` takes a plain `template: string` — no `templateFn`/`config` normalization layer.
- Defaults differ: `tagName: 'section'`, `mountTarget: '#app'` (vs. `Component`'s `tagName: 'div'`).
- `View` tracks route params and adds router-only hooks `onEnter()`/`onExit()` — see [How do I access route parameters?](./HOWDOI_ACCESS_ROUTE_PARAMS.md) and [What lifecycle hooks are available?](../LIFECYCLE_HOOKS/WHAT_LIFECYCLE_HOOKS_ARE_AVAILABLE.md).
- Views are constructed via a factory function referenced from the route table, not instantiated directly by application code the way components are.

## `ViewOptions`

```ts
interface ViewOptions {
  template?: string;
  mountTarget?: string | HTMLElement; // default: '#app'
  tagName?: keyof HTMLElementTagNameMap; // default: 'section'
  viewName: string;
  trustLevel?: 'strict' | 'normal' | 'trusted'; // default: 'normal'
}
```

`viewName` is required — it's the view's identity, and there's no auto-derived default.

On every route change, `document.title` is resolved in this order: matching route's `config/seo.json` (with `generateSEOFiles` enabled - see [How do I use SEO files generation?](../../OPTIONS_AND_FEATURES/HOWDOI_USE_SEO_FILE_GENERATION.md)) -> the view's locale file's `title` key (with `i18n` enabled — see [How do I use i18n?](../../OPTIONS_AND_FEATURES/HOWDOI_USE_I18N.md)) -> the view's `viewName` itself.

`viewName` is emitted in the `view-mount`/`view-unmount` events fired by the router; see [How do I listen to application events?](../EVENTS/HOWDOI_LISTEN_TO_APPLICATION_EVENTS.md).
