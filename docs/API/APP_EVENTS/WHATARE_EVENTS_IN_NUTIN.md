# What are events in Nutin?

## Application events `AppEventBus` — the app-wide pub/sub bus

Application events handle the communication between modules. 

`AppEventBus` (itself a `Service` singleton — see [What is a service?](../SERVICES/WHATIS_A_SERVICE.md)) is how independent parts of the app — components, views, and services that otherwise have no reference to each other — communicate.

```ts
AppEventBus.subscribe('language-changed', (data) => console.log(data.lang));
AppEventBus.emit('language-changed', { lang: 'fr' });
AppEventBus.off('language-changed', callback);
```

Event names and payload shapes are typed via a global `EventMap`, built from the framework's own `FrameworkEventMap` plus an `AppEventMap` your app extends through TypeScript declaration merging — a compile-time-only mechanism; the bus itself accepts any string key at runtime. 

See [How do I listen to application events?](./HOWDOI_LISTEN_TO_APPLICATION_EVENTS.md) and [How do I emit events?](./HOWDOI_EMIT_EVENTS.md).

Inside a component or view, prefer `this.listen(event, callback)` over calling `AppEventBus.subscribe` directly — it auto-unsubscribes on `destroy()`, where a raw subscription would otherwise leak.

## `Lifecycle` and `Navigation` — typed facades over the event bus

`Lifecycle` and `Navigation` (from `core/index.ts`) aren't separate event systems — they're thin, typed wrappers around `AppEventBus` for a fixed set of framework event names, and unlike raw `AppEventBus.subscribe`, their `on*` methods return an unsubscribe function.

- `Navigation.navigateTo(path)` / `Navigation.reload()` — consumed by the router itself..
- `Lifecycle.onViewMount(cb)` / `Lifecycle.onViewUnmount(cb)` — the only two `Lifecycle` events Nutin actually emits, fired by the router on every navigation.
- `Lifecycle.beforeRender()`/`afterRender()`/`beforeDestroy()`/`afterDestroy()` - Nutin never emits these particular `Lifecycle` events itself. See [What lifecycle hooks are available?](../LIFECYCLE_HOOKS/WHAT_LIFECYCLE_HOOKS_ARE_AVAILABLE.md) for the full breakdown.

## DOM events

`data-event="click:_handler"` attributes in a template — local to one component/view, bound and rebound on every render, and torn down automatically in `destroy()`. Unrelated to the app event bus. See [How do I handle DOM events?](../COMPONENTS/HOWDOI_HANDLE_DOM_EVENTS.md).
