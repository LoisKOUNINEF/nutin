# How do I register event types?

Events and their payloads are typed via a global `EventMap`, built from the framework's own `FrameworkEventMap` plus an `AppEventMap` your app extends via TypeScript declaration merging:

```ts
// src/app/globals.d.ts
declare interface AppEventMap {
  'my-event': {};
  'my-payload-event': { myObject: { /* ... */ } };
}
```

This merge is purely a compile-time typing mechanism — `AppEventMap`/`EventMap` are ambient interfaces, not exported values, so you can't `import { AppEventMap }` from anywhere. The underlying event bus isn't restricted to statically known keys at runtime; the declaration only adds type safety on top of it.

```ts
AppEventBus.emit('my-event', {}); // now type-checked against your declared payload shape
AppEventBus.emit('my-unregistered-event', {}); // payload can have any shape
```
