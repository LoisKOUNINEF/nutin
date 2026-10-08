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

`registerCleanup(fn)` is `protected` — call it from inside your own service (typically the constructor) to queue teardown logic. Override `onDestroy()` for teardown that needs to be async.

A service is torn down in one of three ways, and each one runs the queued `registerCleanup` callbacks, then removes the instance from the singleton registry:

- **`myService.dispose()`** — runs the callbacks synchronously. It doesn't call `onDestroy()`.
- **`MyService.destroy()`** — awaits `onDestroy()`, then runs the callbacks.
- **`Service.destroyAll()`** — does the same for every service.

Nothing runs on page unload: the browser frees everything when the page goes away, and tearing services down on `beforeunload` would leave a page restored from the back/forward cache with every service already disposed.

## Test-only resets

```ts
MyService.testingReset();     // drops this class's instance from the registry
Service.testingResetAll();    // drops every instance
```

These are synchronous and run **no cleanup at all** — neither `registerCleanup` callbacks nor `onDestroy()`. They exist purely to reset singleton state between test cases; using them in application code would silently skip real cleanup and leak resources.

```ts
MyService.hasInstance(MyService); // boolean — has getInstance() been called yet?
```
