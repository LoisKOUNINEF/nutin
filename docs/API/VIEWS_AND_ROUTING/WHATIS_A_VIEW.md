# What is a view?

A view is the **top-level orchestrator for a single route**. `Component` and `View` are siblings - both extend `BaseComponent`.

A view takes a raw `template: string` instead of `Component`'s `templateFn`, since a view doesn't get construction-time data from a parent the way a component does.

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

## Route params

A view tracks the current route's params, set by the router via `setRouteParams()` immediately before each render.

See [How do I access route parameters?](./HOWDOI_ACCESS_ROUTE_PARAMS.md).
