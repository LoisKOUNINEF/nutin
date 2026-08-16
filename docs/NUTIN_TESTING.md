# nutin testing toolkit (testin-nutin)

## Table of Contents

- [Overview](#overview)
- [Writing a test](#writing-a-test)
- [Assertions](#assertions)
- [Spies](#spies)
- [Silencing console output](#silencing-console-output)
- [Clock](#clock)
- [Mocking core services](#mocking-core-services)
- [How a run works](#how-a-run-works)
- [Coverage](#coverage)
- [Config](#config)
- [Where to look in code](#where-to-look-in-code)

This documents `testin-nutin`, nutin's built-in test toolkit, shipped by default - Nutin source code is tested exclusively with it. It's a small hand-built test runner + jsdom environment + assertion library + service mocks.

## Overview

```json
"testin-nutin": "<pm> run build && node tools/testin-nutin/runner.js",
"testin-nutin:watch": "<pm> run build && node tools/testin-nutin/watch-tests.js"
"testin-nutin:only": "node tools/testin-nutin/runner.js",
"testin-nutin:coverage": "<pm> run build && node tools/testin-nutin/runner.js --coverage",
```

The test environment loads the **built development output** (not bundled nor minified) `dist/src/index.html` into jsdom (see [How a run works](#how-a-run-works)) — running `testin-nutin:only` directly only works if `dist/` is already up to date.

Every generated app's `package.json` gets an `"imports": { "#root/*.js": "./*.js" }`
entry (added by the CLI's `json-manager.mjs`, not a template file), so test
files can write `import config from '#root/nutin.config.js'` instead of a
long chain of `../../..`.

## Writing a test

Files matching `*.test.js`, anywhere under a configured origin directory, are
discovered automatically (see [Config](#config)). Global API, installed by
the runner before any test file loads — no imports needed in test files:

```js
describe('globals beforeEach/All and afterEach/All', () => {
  // `beforeEach/All` and `afterEach/All` must be INSIDE a `describe` block
  beforeAll(() => { beforeAllCount++; });
  beforeEach(() => { beforeEachCount++; });
  afterEach(() => { afterEachCount++; });
  afterAll(() => { console.debug('afterAll called.'); });

  it('should be called once for all and once for each', () => {
    expect(beforeAllCount).toEqual(1);
    expect(beforeEachCount).toEqual(1);
    expect(afterEachCount).toEqual(0);
  });
  it.todo('Keep counting.');
});
```

- `describe(name, fn)` / `it(name, fn)` — **no `test()` alias**, only `it`.
- `beforeAll` / `beforeEach` / `afterEach` / `afterAll` — one hook of each
  kind per suite; declaring a second one in the same `describe` silently
  overwrites the first (no stacking/composition).
- DOM helpers: `$(selector)` / `$$(selector)` (`querySelector`/
  `querySelectorAll` shorthands), `click(el)`, `type(el, text)`.
- `setupJsdom` / `teardownJsdom` / `resetDom` / `flushPromises` are also
  exposed as globals if a test needs to manage the DOM environment directly.

## Assertions

`expect(actual)` returns a Jest/Chai-style matcher chain; every matcher
throws a descriptive `Error` on failure.

| Matcher | Checks |
|---|---|
| `.toBe(expected)` | strict equality (`===`) |
| `.toEqual(expected)` | recursive deep equality (arrays/plain objects) |
| `.toContain(substring)` | `actual.includes(substring)` (strings or arrays) |
| `.toBeTruthy()` / `.toBeFalsy()` | truthiness |
| `.toBeDefined()` | not `null`/`undefined` |
| `.toBeUndefined()` | `null` **or** `undefined` (passes for `null` too, despite the name) |
| `.toBeInstanceOf(ctor)` | `actual instanceof ctor` |
| `.toHaveBeenCalled()` | spy/mock handle has a non-empty `.calls` |
| `.toHaveBeenCalledWith(...args)` | deep-equal match against any recorded call |
| `.toBeLessThan(expected)` | fails only if `actual > expected` |
| `.toBeGreaterThan(expected)` | fails only if `actual < expected` |
| `.toThrow(expectedMessage?)` | `actual()` throws; if given, the error message must include `expectedMessage` |

`.not` is supported on every matcher above — it's built generically by
wrapping each one to invert pass/fail, e.g. `expect(x).not.toBe(y)`.

## Spies

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

## Silencing console output

```js
silenceConsole('warn', () => registerPipes());
silenceConsole(['info', 'error'], () => runScript(scriptPath, message));
```

`silenceConsole(methodOrMethods, fn)` wraps a single call, spying on and
no-op'ing one or more `console` methods (a single name or an array) for the
duration of that call, then restoring them automatically — before returning
the call's result. Works for both sync and async `fn`: a thenable return
value is awaited before restoring, so the spies stay installed for the
whole async operation.

Use it for expected-but-noisy console output you don't need to assert
on — e.g. a real `console.warn` from calling `registerPipes()` when the
pipes are already registered (`AppPipeRegistry` is a shared singleton, so
several suites call it defensively; see `pipes.test.js`/
`pipe-registry.test.js`/the `overlays` feature's `modal.test.js`). If a test
needs to assert *what* was logged (`.callCount`, `.lastCall`), use
`spyOn(console, 'method')` directly instead — `silenceConsole` doesn't
expose the underlying spy handle.

## Clock

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
  of the call** (one "wave"); timers newly scheduled by those callbacks are
  left for a later call, unlike `runAllTimers()`.
- `clearAllTimers()` — drops all pending timers without firing them.
- `getTimerCount()` — number of currently pending timers.
- `setSystemTime(msOrDate)` — sets the virtual clock directly (accepts a
  `Date` or a ms timestamp), without firing anything.

`advanceTimersByTime()` and `runAllTimers()` both guard against infinite
loops — e.g. a zero-delay `setInterval` that keeps rescheduling itself —
and throw a descriptive error after 100,000 timer firings.

Every function above except `useFakeTimers`/`useRealTimers` throws
`"<name>() requires useFakeTimers() to be called first"` if called before
fakes are installed, so the usual pattern is
`beforeEach(() => useFakeTimers())` / `afterEach(() => useRealTimers())` —
the latter matters even on a passing test, since fakes otherwise leak into
later suites.

Under fake timers, `Date.now()` and no-arg `new Date()` return the virtual
clock; `new Date(explicit args)` still constructs a real, unaffected date.

See `testin-nutin/core/tests/clock.test.js` for the full behavior this
covers, and the `overlays` feature's `snackbar.test.js`/`dropdown.test.js`
for real usage (auto-dismiss timing, flushing a deferred bind via
`advanceTimersByTime(0)`).

## Mocking core services

For services that shouldn't hit real state (event bus, HTTP, i18n, router),
`testin-nutin/mocks/` provides plain classes built from a shared factory,
`createMockMethod()`:

```js
fn.calls                        // recorded argument arrays
fn.mockReturnValue(value)       // always return value
fn.mockImplementation(implFn)   // delegate to implFn
fn.mockReset()                  // clear calls + both overrides
```

Unlike `spyOn`, an unconfigured mock method returns `undefined` — there's no
"original" to fall back to. `MockI18n` passes a default
implementation function into `createMockMethod(fn)`, but the factory ignores
any argument — those inline defaults are dead code, so e.g.
`mockI18n.translate('key')` returns `undefined` until a test explicitly
calls `.mockImplementation(...)` on it.

There's no auto-mocking or DI container — substitution is manual constructor
injection, since the core event-bus facades and similar services take their
dependency as a typed constructor param.

| Mock | File | Mocks (see NUTIN.md) | Notable methods |
|---|---|---|---|
| `MockEventBus` | `mocks/mock-event-bus.js` | `AppEventBus` | `on`/`off`/`emit` form a real in-memory pub/sub; `subscribe` is a bare mock (doesn't actually register — asymmetric with `on`) |
| `MockHttpClient` | `mocks/mock-http-client.js` | `AppHttpClient` | `get`/`post`/`put`/`patch`/`delete`, all bare mocks |
| `MockI18n` | `mocks/mock-i18n.js` | `I18nService` | `translate`, `loadTranslations`, etc. (bare mocks, see gotcha above); real `currentLanguage` getter; `setTranslations()`/`setDefaultTranslations()` to seed state directly |
| `MockRouter` | `mocks/mock-router.js` | `Router`/`AppRouter` | `navigate`, `handlePopState`, `handleNotFound`, `handleGuards`, `initializeEventListeners` — names match the real class 1:1, though several are `private` there |

The shared spy factory itself lives at `mocks/create-mock-method.js`.

## How a run works

`node tools/testin-nutin/runner.js` (alias `npm run testin-nutin:only`; `npm run testin-nutin` runs a build first):

1. Installs test globals (`registerTestGlobals()`).
2. Resolves test files by recursively scanning an `origins` list for
   `*.test.js` (`getTestFiles`, plain `fs.readdirSync`, no glob lib) —
   `origins` isn't itself a config key, it's built at runtime from
   `testinNutin.includeFramework` (adds the framework's own test dirs),
   `testinNutin.includeTools` (adds `tools`), and `testinNutin.includeApp`
   (adds `src/app`). Optional CLI args filter files by substring match.
3. For each file: sets up a fresh jsdom, `import()`s the file (this just
   *registers* its `describe`/`it` calls into a queue — nothing runs yet),
   tears the jsdom down. Import errors are caught and printed, not thrown.
4. `runQueuedTests()` then executes the queue: strictly **sequential**, one
   test at a time. jsdom is reset **per suite boundary** (not per test) —
   detected when `test.suiteName` changes — running the outgoing suite's
   `afterAll` then the incoming suite's `beforeAll`. Each test runs
   `beforeEach → testFn → afterEach`, all awaited; a thrown error is caught
   and recorded as a failure rather than aborting the run.
5. Console output (`print.js`, hand-rolled ANSI colors, no `chalk`
   dependency): failing tests are always printed with their stack trace;
   passing tests are only printed if `config.verbose`. A final summary
   prints pass/fail counts and elapsed time.

`npm run testin-nutin:watch` builds once, then runs `watch-tests.js`: a
chokidar watcher on `src`/`test`/`unit`/`e2e` that re-runs the **entire**
suite (`node tools/testin-nutin/runner.js` via `child_process.exec`) on any
change — no selective re-run, and no rebuild between runs.

## Coverage

Run it with `npm run testin-nutin:coverage`, or set `testinNutin.coverage.enabled: true` to make
it the default for the plain `testin-nutin` command.

Coverage is real V8 precise coverage, collected via `node:inspector`'s
`Profiler` API (`core/coverage/collect-coverage.js`) — not a static/AST
instrumenter.

**Scope**: only the **compiled** output under `dist/src/core` + `dist/src/libs`
(when `includeFramework`) and `dist/src/app` (when `includeApp`). **`tools/`
is never scoped into coverage, even when `includeTools: true`** — tools
tests run, but don't count toward the report or the threshold.

Three metrics are computed per file (`core/coverage/compute-coverage.js`),
each intentionally lightweight rather than exact:

- **Lines** — samples the execution count at each line's first
  non-whitespace character; not full statement-level coverage.
- **Functions** — every V8-reported function range except the
  whole-script pseudo-function.
- **Branches** — every V8 range nested inside a function's own top-level
  range (`if`/`else` arms, ternaries, `switch` cases, `&&`/`||`
  short-circuits, loop bodies) — reuses data V8 already collects, no AST
  parsing involved.

Output is a per-file `console.table` (paths are shown with a cosmetic
`.ts` extension, though coverage is measured against the compiled `.js`)
plus a global `branches/functions/lines %` summary line — which also shows
the configured `testinNutin.coverage.threshold`, when set, for context
(e.g. `Global:  88.0% branches, 95.0% functions, 92.3% lines  (threshold: 95%)`).

`coverage/summary.md` is written **unconditionally** on every coverage run
that produces a non-empty report — the test summary (pass/fail/todo/total/time,
same numbers `printSummary` already prints for every run), the per-file
table, and the global percentages (plus the threshold, when set), all
persisted as a standing artifact (e.g. for CI). Unlike `uncovered.md`
below, it isn't gated by `reportUncovered` and doesn't depend on whether
anything is actually uncovered or whether the threshold passed.

If `testinNutin.coverage.reportUncovered` is true and anything is actually
uncovered, `coverage/uncovered.md` is written listing uncovered
lines/branches/functions per file (otherwise a run with nothing uncovered
just prints "🎉 No uncovered code found."). **Line numbers in that report
refer to the compiled `dist/src/` output, not the original `.ts` source.**

If `testinNutin.coverage.threshold` is a number and any global metric
(lines/functions/branches) falls below it, the process exits with code 1
after printing which metric(s) missed and by how much — useful as a CI gate.

## Config

`testinNutin` block in `nutin.config.js`:

```js
testinNutin: {
  includeFramework: true,  // test Nutin source - src/core and src/libs
  includeTools: false,     // test tools/ (builder, testin-nutin, etc.)
  includeApp: false,       // enable to use testin-nutin for application tests
  verbose: false,          // log test suites and individual `it` tests
  coverage: {
    enabled: false,        // include coverage in the normal test command
    threshold: 95,         // exit with code 1 if any global coverage metric falls below the threshold
    reportUncovered: true, // generates an .md report of uncovered lines, functions and branches in coverage/
  },
  jsdomOptions: {
    runScripts: false,     // or true ("dangerously") to execute scripts in the DOM
    resources: false,      // or true ("usable") to load external resources
    freezeGlobals: false,
    pretendToBeVisual: true,
  },
}
```

## Where to look in code

All paths below are relative to a generated app's `tools/testin-nutin/`:

* `core/globals/` — `assertion-lib.js` (extend the matcher set here),
  `clock.js`, `jsdom-setup.js`, `register-test-globals.js`,
  `silence-console.js`, `spyon.js`.
* `core/coverage` - `collect-coverage.js`, `compute-coverage.js`, `write-summary-report.js`, `write-uncovered-report.js`.
* `core/queue/` — `queue.js` (linked-list `Queue`), `test-discovery.js`,
  `test-queue.js` (drives `runQueuedTests()` off that `Queue`).
* `core/tests/` — the toolkit's own tests for the assertions/globals/clock
  above.
* `core/printer.js` — re-exports the hand-rolled `chalk`/`print` console
  helpers from the repo-wide `tools/utils/print.js` and provides printer methods (`printSummary`...).
* `mocks/` — see [Mocking core services](#mocking-core-services).
* `runner.js` / `watch-tests.js` — the two entrypoints.

***The test runner's execution queue owes its design to ThePrimeagen's Data
Structures and Algorithms course.***
