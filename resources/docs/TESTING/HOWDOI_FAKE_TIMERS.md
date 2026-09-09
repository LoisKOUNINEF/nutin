# How do I fake timers?

Fake timers for time-dependent code (`setTimeout`/`setInterval`/`Date`),
installed as globals the same way as spies — no imports needed:

```js
useFakeTimers();
let fired = false;
setTimeout(() => { fired = true; }, 1000);
advanceTimersByTime(1000);
expect(fired).toBeTruthy();
useRealTimers();
```

- `useFakeTimers()` — replaces `setTimeout`/`clearTimeout`/`setInterval`/
  `clearInterval`/`Date`/`requestAnimationFrame`/`cancelAnimationFrame` on
  both `global` and `window` (if present) with fakes backed by a virtual
  clock. No-op if already installed; resets the virtual clock to the real
  current time.
- `useRealTimers()` — restores the originals captured by `useFakeTimers()`.
  No-op if fakes aren't installed.
- `advanceTimersByTime(ms)` / `tick(ms)` (alias) — fires every timer due at
  or before "virtual now + ms", in due order — including timers scheduled
  by other timers as they fire — then moves the virtual clock forward by
  `ms`.
- `runAllTimers()` — repeatedly fires the earliest-pending timer, advancing
  the virtual clock to each timer's due time, until none remain. Use this
  for chains of timers scheduling further timers, where exact delays don't
  matter.
- `runOnlyPendingTimers()` — fires only the timers pending **at the moment
  of the call**; timers newly scheduled by those callbacks are
  left for a later call, unlike `runAllTimers()`.
- `clearAllTimers()` — drops all pending timers without firing them.
- `getTimerCount()` — number of currently pending timers.
- `setSystemTime(msOrDate)` — sets the virtual clock directly (accepts a
  `Date` or a ms timestamp), without firing anything.

- `advanceTimersByTime()` and `runAllTimers()` both guard against infinite
loops — e.g. a zero-delay `setInterval` that keeps rescheduling itself —
and throw a descriptive error after 100,000 timer firings.

- Every function above except `useFakeTimers`/`useRealTimers` throws
`"<name>() requires useFakeTimers() to be called first"` if called before
fakes are installed, so the usual pattern is
`beforeEach(() => useFakeTimers())` / `afterEach(() => useRealTimers())` —
the latter matters even on a passing test, since fakes otherwise leak into
later suites.

- Under fake timers, `Date.now()` and no-arg `new Date()` return the virtual
clock; `new Date(explicit args)` still constructs a real, unaffected date.

- See `testin-nutin/core/tests/clock.test.js` for the full behavior this
covers.

See [How do I silence console output?](./HOWDOI_SILENCE_CONSOLE_OUTPUT.md).
