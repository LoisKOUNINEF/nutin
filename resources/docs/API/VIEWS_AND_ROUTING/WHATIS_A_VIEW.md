# What is a view?

A view is the **top-level orchestrator for a single route**. `Component` and `View` are siblings - both extend `BaseComponent`.

A view takes a static `template` (an `html` template or a string) instead of `Component`'s `templateFn`, since a view doesn't get construction-time data from a parent the way a component does.

A view is meant to contain the least amount of logic possible, if any, and to organize its children. The actual UI and behavior should live in the components it mounts via `registerChildren()`. 

**A route always corresponds to exactly one view**, constructed by a factory function referenced from the route table. 

See [How do I create a view?](./HOWDOI_CREATE_A_VIEW.md) and [How do I register a route?](./HOWDOI_REGISTER_A_ROUTE.md).

## Router-only hooks

Beyond the render/destroy hooks every `BaseComponent` has, `View` adds `onEnter()`/`onExit()` — fired only by the router, never by `render()`/`destroy()` directly, in this exact sequence on navigation:

```
oldView.destroy() → oldView.onExit() → view-unmount event
newView.setRouteParams(params) → newView.render() → newView.onEnter() → view-mount event
```

Notably, `onExit()` fires *after* `destroy()` (the old element is already gone and listeners already torn down), and `onEnter()` fires *after* `render()`, not before. A view rendered by hand outside the router (e.g. `new SomeView().render()`) never has `onEnter`/`onExit` called. 

See [What lifecycle hooks are available?](../LIFECYCLE_HOOKS/WHAT_LIFECYCLE_HOOKS_ARE_AVAILABLE.md).

## Document title

After each navigation, the router sets `document.title`. A view can provide its own, e.g. from the content it shows, by overriding `documentTitle()`:

```ts
public override documentTitle(): string | undefined {
  return this.article?.title;
}
```

When it returns `undefined` (the default), the router uses the route's `config/seo.json` title (with `generateSEOFiles`), then the `<viewName>.title` translation (with i18n), then `viewName`.

## Focus after navigation

After an in-app navigation (a link, `Navigation.navigateTo()`, back/forward, a guard redirect or the `/404` view), the router moves keyboard focus to the new view, so keyboard and screen-reader users start from it instead of from the top of the page, where focus falls once the link they used is gone:

1. the view's first `<h1>`;
2. otherwise, the `<h1>` inside `<main>` (e.g. one written in `index.html` around the view);
3. otherwise, the view's own element, and the page title (`document.title`, see above) is announced through a visually hidden live region.

When a heading takes focus, nothing is announced separately: screen readers read the focused heading, which tells the user the page changed. The live region is only for a view without one, whose element has nothing meaningful to read.

If the focused element has no `tabindex`, it gets `tabindex="-1"` (so it can take focus without becoming a tab stop) and no focus ring, since it isn't interactive; both are removed once it loses focus. Screen readers still read it, and Tab continues from it. An element with its own `tabindex` keeps its own focus styling. The page doesn't scroll to it, so a `#hash` target stays in view.

The first page load and `Navigation.reload()` leave focus where it is: the first load is the browser's to handle, and a reload re-renders the page the user is already on.

## Route params

A view tracks the current route's params, set by the router via `setRouteParams()` immediately before each render.

See [How do I access route parameters?](./HOWDOI_ACCESS_ROUTE_PARAMS.md).
