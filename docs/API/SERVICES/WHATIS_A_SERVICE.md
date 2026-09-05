# What is a service?

A service holds state or logic that needs to stay consistent across the whole app, independent of any single component's or view's lifecycle. Every service extends the abstract `Service<T>` base class, which is a singleton — Nutin guarantees at most one instance of each service class exists.

```ts
export class ExampleService extends Service<ExampleService> {}
export const exampleService = ExampleService.getInstance();
```

Calling `new ExampleService()` directly throws — `getInstance()` is the only valid construction path, and the "consistency" a service provides comes precisely from that guarantee: every consumer that imports the exported singleton const is reading and writing the same instance. There's no dependency-injection container — a component, view, or another service just imports the const and calls its methods. 

See [How do I create a service?](./HOWDOI_CREATE_A_SERVICE.md) and [How do I use a service?](./HOWDOI_USE_A_SERVICE.md).

Every service method is auto-bound to its instance at construction, so methods can be destructured or passed around as bare callbacks without losing `this`.

## Cleanup

A service has two independent teardown paths — `dispose()` (runs `registerCleanup()`-queued callbacks, wired automatically to `window.beforeunload`) and `Service.destroy()`/`destroyAll()` (awaits the `onDestroy()` hook). They cover different kinds of teardown and aren't interchangeable. See [How do I register service cleanup?](./HOWDOI_REGISTER_SERVICE_CLEANUP.md).

## Nutin services are services too

Nutin's own cross-cutting pieces are built the same way application services are. As an example, `AppEventBus` (the app event bus — see [What are events in Nutin?](../EVENTS/WHATARE_EVENTS_IN_NUTIN.md)) and `Router` (see [How do I register a route?](../VIEWS_AND_ROUTING/HOWDOI_REGISTER_A_ROUTE.md)) are both `Service` singletons under the hood.
