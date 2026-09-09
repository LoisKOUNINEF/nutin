# How do I emit events?

## Basic usage

```ts
import { AppEventBus } from '../../../core/index.js';

AppEventBus.emit('language-changed', { lang: 'fr' });
```

`emit(event, data?)` is fire-and-forget and synchronous — it calls every current subscriber immediately, in registration order, and returns `void`. There's no queuing or async dispatch, so a subscriber added *after* `emit()` runs won't see that call. See [How do I listen to application events?](./HOWDOI_LISTEN_TO_APPLICATION_EVENTS.md) for subscribing.

## Typed payloads via `EventMap`

Events and their payloads are typed via a global `EventMap`, built from the framework's own `FrameworkEventMap` plus an `AppEventMap` your app extends via TypeScript declaration merging:

```ts
// src/app/globals.d.ts
declare interface AppEventMap {
  'my-event': {};
}
```

This merge is purely a compile-time typing mechanism — `AppEventMap`/`EventMap` are ambient interfaces, not exported values, so you can't `import { AppEventMap }` from anywhere. The underlying event bus isn't restricted to statically known keys at runtime; the declaration only adds type safety on top of it.

```ts
AppEventBus.emit('my-event', {}); // now type-checked against your declared payload shape
AppEventBus.emit('my-unregistered-event', {}); // payload can have any shape
```

See [What are events in Nutin?](./WHATARE_EVENTS_IN_NUTIN.md) for how this fits alongside DOM events and the `Lifecycle`/`Navigation` facades.
