# What lifecycle hooks are available?

## Overridable hooks

All `protected`, all no-op by default except `generateTemplate()`/`registerChildren()`:

```ts
protected onBeforeRender(): void {}
protected onAfterRender(): void {}
protected onBeforeDestroy(): void {}
protected onAfterDestroy(): void {}
protected onReuse(): void {}
protected generateTemplate(): Template { return ''; }    // Component/View override this
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
element.replaceChildren(sanitizeToFragment(generateTemplate()))
compose()          → addChildren()             (mount data-component/data-catalog children)
child.onReuse()    for every kept child (see below)
hydrate()          → parseDataAttributes()     (data-i18n, data-pipe)
                   → cleanupOptionalContent()  (data-optional)
autoBindEvents()   → rebinds all data-event listeners
onAfterRender()
```

`hydrate()` leaves `data-pipe` inside child components alone: each child already piped its own content.

- `onReuse()`:

Called on a child kept across its parent's re-render — one registered with a `key`, or a catalog item with `trackBy` whose item didn't change. A kept child isn't rendered or destroyed, so none of the other hooks fire for it: its existing DOM is moved into the parent's new template as-is, then `onReuse()` is called. Use it for light work on that existing DOM (re-measuring, re-reading a value); don't rebuild the DOM in it — that's what a new key is for. See [How do I register child components?](../COMPONENTS/HOWDOI_REGISTER_CHILD_COMPONENTS.md#keeping-children-across-re-renders).

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
newView = route's factory()   (a lazy route's chunk loads here, while the old view stays up)
oldView.destroy()
oldView.onExit()
view-unmount event
newView.setRouteParams(params)
newView.render()
newView.onEnter()
view-mount event
document.title updated, scroll to the URL's #hash, focus moved to the new view
```

A view rendered outside the router (e.g. `new SomeView().render()` by hand) never has `onEnter`/`onExit` called.

## `Lifecycle` event-bus facade — a separate mechanism

`Lifecycle` (from `core/index.ts`) exposes emitters/subscribers with the *same names* as the hooks above (`beforeRender`, `afterRender`, `beforeDestroy`, `afterDestroy`, plus `viewMount(viewName)`/`viewUnmount(viewName)`):

```ts
Lifecycle.onViewMount(({ viewName }) => console.log('mounted', viewName));
```

Only `viewMount`/`viewUnmount` are actually emitted by the framework (from the router, on every navigation). `Lifecycle.beforeRender()`/`afterRender()`/`beforeDestroy()`/`afterDestroy()` are **not** auto-emitted by `render()`/`destroy()` or by the protected hooks above — overriding `onBeforeRender()` on your own component customizes that component's own render step, but does not cause `Lifecycle.onBeforeRender(cb)` subscribers elsewhere in the app to fire. Treat the two as unrelated, same-named mechanisms.

## Important

- `Component` overrides `onBeforeRender()`/`onAfterRender()` internally to apply `props`/data-bindings — a `Component` subclass that overrides these must call `super.onBeforeRender()`/`super.onAfterRender()` or it loses that behavior. `View` doesn't override either, so this doesn't apply there.
- `render()` guards against re-entrancy: calling `this.render()` again from inside `onBeforeRender`/`onAfterRender` (e.g. synchronously from a render-event handler) is a silent no-op rather than a recursive loop.
