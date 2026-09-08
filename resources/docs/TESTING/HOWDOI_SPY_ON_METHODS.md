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

See [How do I fake timers?](./HOWDOI_FAKE_TIMERS.md).
