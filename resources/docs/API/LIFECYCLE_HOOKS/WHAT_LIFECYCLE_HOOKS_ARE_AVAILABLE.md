# What lifecycle hooks are available?

## Overridable hooks

All `protected`, all no-op by default except `generateTemplate()`/`registerChildren()`:

```ts
protected onBeforeRender(): void {}
protected onAfterRender(): void {}
protected onBeforeDestroy(): void {}
protected onAfterDestroy(): void {}
protected generateTemplate(): string { return ''; }      // Component/View override this
public registerChildren(): ComponentConfig[] { return []; }
```

`View` additionally exposes:

```ts
public onEnter(): void {}
public onExit(): void {}
```

## Firing order

- `render()`:

```
onBeforeRender()
element.innerHTML = sanitize(generateTemplate())
compose()          → addChildren()             (mount data-component/data-catalog children)
hydrate()          → parseDataAttributes()     (data-i18n, data-pipe)
                   → cleanupOptionalContent()  (data-optional)
autoBindEvents()   → rebinds all data-event listeners
onAfterRender()
```

`destroy()`:

```
onBeforeDestroy()
EventHelper.destroyEvents(...)      — remove all data-event DOM listeners
AppEventBus.off(...) for every bus subscription made via this.listen()
ChildrenHelper.destroyChildren(...) — recursively destroy() every child
element.remove()
onAfterDestroy()
```

- `onEnter()`/`onExit()`: 

These are called **only by the router**, never by `render()`/`destroy()` — they fire on navigation, not on every re-render. In the full navigation sequence: 

```
oldView.destroy() 
oldView.onExit() 
view-unmount event 
newView.setRouteParams(params) 
newView.render() 
newView.onEnter() 
view-mount event.
```

A view rendered outside the router (e.g. `new SomeView().render()` by hand) never has `onEnter`/`onExit` called.

## `Lifecycle` event-bus facade — a separate mechanism

`Lifecycle` (from `core/index.ts`) exposes emitters/subscribers with the *same names* as the hooks above (`beforeRender`, `afterRender`, `beforeDestroy`, `afterDestroy`, plus `viewMount(viewName)`/`viewUnmount(viewName)`):

```ts
Lifecycle.onViewMount((viewName) => console.log('mounted', viewName));
```

Only `viewMount`/`viewUnmount` are actually emitted by the framework (from the router, on every navigation). `Lifecycle.beforeRender()`/`afterRender()`/`beforeDestroy()`/`afterDestroy()` are **not** auto-emitted by `render()`/`destroy()` or by the protected hooks above — overriding `onBeforeRender()` on your own component customizes that component's own render step, but does not cause `Lifecycle.onBeforeRender(cb)` subscribers elsewhere in the app to fire. Treat the two as unrelated, same-named mechanisms.

## Gotchas

- `Component` overrides `onBeforeRender()`/`onAfterRender()` internally to apply `props`/data-bindings — a `Component` subclass that overrides these must call `super.onBeforeRender()`/`super.onAfterRender()` or it loses that behavior. `View` doesn't override either, so this doesn't apply there.
- `render()` guards against re-entrancy: calling `this.render()` again from inside `onBeforeRender`/`onAfterRender` (e.g. synchronously from a render-event handler) is a silent no-op rather than a recursive loop.
