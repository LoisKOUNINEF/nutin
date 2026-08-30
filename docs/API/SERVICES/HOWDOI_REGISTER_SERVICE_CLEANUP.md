# How do I register service cleanup?

```ts
export class PollingService extends Service<PollingService> {
  private _intervalId: ReturnType<typeof setInterval>;

  constructor() {
    super();
    this._intervalId = setInterval(() => this.poll(), 5000);
    this.registerCleanup(() => clearInterval(this._intervalId));
  }

  protected onDestroy(): void {
    // async/custom teardown logic goes here
  }
}
```

`registerCleanup(fn)` is `protected` — call it from inside your own service (typically the constructor) to queue teardown logic. There are two independent cleanup paths, and they run **different** things:

- **`dispose()`** — runs every queued `registerCleanup` callback, then clears the callback list and removes the instance from the singleton registry. This is wired automatically to `window.beforeunload` for every service instance; you never call it yourself.
- **`Service.destroy(MyService)` / `Service.destroyAll()`** — awaits and calls `onDestroy()` on the instance(s), then removes them from the registry. This does **not** run `registerCleanup` callbacks — only the `onDestroy()` hook. `main.ts` typically wires `Service.destroyAll()` to `window.beforeunload` at the app level, so in practice both paths can fire on unload, each covering a different kind of teardown.

Override `onDestroy()` for cleanup that needs to be async or explicitly triggered (e.g. from app shutdown logic), and use `registerCleanup()` for cleanup that should always run alongside every other service's, on page unload.

## Test-only resets

```ts
MyService.testingReset();     // drops this class's instance from the registry
Service.testingResetAll();    // drops every instance
```

These are synchronous and run **no cleanup at all** — neither `registerCleanup` callbacks nor `onDestroy()`. They exist purely to reset singleton state between test cases; using them in application code would silently skip real cleanup and leak resources.

```ts
MyService.hasInstance(MyService); // boolean — has getInstance() been called yet?
```
