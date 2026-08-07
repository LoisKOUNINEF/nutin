# nutin testing toolkit (testin-nutin)

This documents `testin-nutin`, nutin's built-in test toolkit, shipped by the
optional `testinNutin` CLI feature (off by default; on in the `full`
preset). It's a small hand-built test runner + jsdom environment + assertion
library + service mocks — not a Jest/Vitest wrapper, no external test
framework dependency. Assumes familiarity with the core framework and libs
documented in [`NUTIN.md`](./NUTIN.md) and [`NUTIN-LIBS.md`](./NUTIN-LIBS.md).

## Overview

Enabling `testinNutin` adds:

```json
"test": "node testin-nutin/runner.js",
"test:rebuild": "<pm> run build && <pm> run test",
"test:watch": "<pm> run build && node testin-nutin/watch-tests.js"
```

`test:rebuild`/`test:watch` build first because the test environment loads
the **built** `dist/src/index.html` into jsdom (see [How a run works](#how-a-run-works)) — running `test` directly only works if `dist/` is already
up to date.

## Writing a test

Files matching `*.test.js`, anywhere under a configured origin directory, are
discovered automatically (see [Config](#config)). Global API, installed by
the runner before any test file loads — no imports needed in test files:

```js
describe('globals beforeEach/All and afterEach/All', () => {
  beforeAll(() => { beforeAllCount++; });
  beforeEach(() => { beforeEachCount++; });
  afterEach(() => { afterEachCount++; });
  afterAll(() => { console.debug('afterAll called.'); });

  it('should be called once for all and once for each', () => {
    expect(beforeAllCount).toEqual(1);
  });
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

| Mock | Mocks (see NUTIN.md) | Notable methods |
|---|---|---|
| `MockEventBus` | `AppEventBus` | `on`/`off`/`emit` form a real in-memory pub/sub; `subscribe` is a bare mock (doesn't actually register — asymmetric with `on`) |
| `MockHttpClient` | `AppHttpClient` | `get`/`post`/`put`/`patch`/`delete`, all bare mocks |
| `MockI18n` | `I18nService` | `translate`, `loadTranslations`, etc. (bare mocks, see gotcha above); real `currentLanguage` getter; `setTranslations()`/`setDefaultTranslations()` to seed state directly |
| `MockRouter` | `Router`/`AppRouter` | `navigate`, `handlePopState`, `handleNotFound`, `handleGuards`, `initializeEventListeners` — names match the real class 1:1, though several are `private` there |
| `MockStore` | **nothing** — see below | `set`/`get`/`subscribe`/`unsubscribe`/`clear` |


## How a run works

`node testin-nutin/runner.js` (i.e. `npm run test`):

1. Installs test globals (`registerTestGlobals()`).
2. Resolves test files by recursively scanning each `config.origins` entry
   for `*.test.js` (`getTestFiles`, plain `fs.readdirSync`, no glob lib).
   Optional CLI args filter files by substring match.
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

`npm run test:watch` builds once, then runs `watch-tests.js`: a chokidar
watcher on `src`/`test`/`unit`/`e2e` that re-runs the **entire** suite
(`node testin-nutin/runner.js` via `child_process.exec`) on any change — no
selective re-run, and no rebuild between runs.

## Config

Intended shape, a `testinNutin` block:

```js
testinNutin: {
  origins: ['src/app'],   // discovery roots for *.test.js
  jsdomOptions: {
    runScripts: false,       // or true ("dangerously")
    resources: false,        // or true ("usable")
    freezeGlobals: false,
    pretendToBeVisual: true,
  },
  verbose: false,
},
```
