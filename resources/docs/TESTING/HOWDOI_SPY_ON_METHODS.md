# How do I spy on methods?

```js
const spy = spyOn(obj, 'methodName');
```

Replaces `obj.methodName` and returns a handle:

- `.calls` — array of argument arrays, one per call
- `.callCount` — `calls.length`
- `.lastCall` — args of the most recent call, or `undefined`
- `.andCallFake(fn)` — delegate subsequent calls to `fn`
- `.andReturn(value)` — short-circuit subsequent calls to return `value`
- `.restore()` — puts the original method back

With neither `.andCallFake` nor `.andReturn` set, calls **pass through** to
the original implementation while still being recorded — spies default to
transparent, not silent.

Restore a spy in a `finally` (or in `afterEach`), so a failing assertion can't leave
it installed for the tests that run after it. A spy keeps its `.calls` after
`.restore()`, so you can restore first and assert after:

```js
const warn = spyOn(console, 'warn').andCallFake(() => {});
try {
  doSomething();
} finally {
  warn.restore();
}
expect(warn.callCount).toBe(1);
```

testin-nutin prints its report with the console it started with, so a `console`
spy left installed can't hide the report.

Core helpers (`DomHelper`, `SecurityHelper`, `NavigationManager`, …) and the
`Lifecycle` facade are modules of functions, imported as read-only namespaces:
`spyOn` can't replace their functions (it throws). Spy on what the function
calls instead, or check its effect:
- a helper: e.g. `spyOn(window.history, 'replaceState')`;
- `Lifecycle`: its functions go through `AppEventBus`, so spy on
  `AppEventBus.emit` (`expect(emit).toHaveBeenCalledWith('view-mount', { viewName: 'home' })`),
  or subscribe with `Lifecycle.onViewMount(cb)` and check what `cb` receives.

`Navigation` is still an object: `spyOn(Navigation, 'navigateTo')` works.

See [How do I fake timers?](./HOWDOI_FAKE_TIMERS.md).
