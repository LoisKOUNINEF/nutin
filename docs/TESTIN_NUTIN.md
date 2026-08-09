# testin-nutin Docs

This toolkit is the opt-in **`testinNutin`** feature (`templates/features/testinNutin/`) — it's only present in a generated app when that feature is enabled.

## Config file

Not a standalone file — it's a `testinNutin` key nested inside your project's `nutin.config.js`:

```js
// nutin.config.js
export default {
  // ...other nutin.config.js keys (builder, i18n, etc.)

  testinNutin: {
    // folders to scan for .test.js files
    origins: ['src/app'],

    jsdomOptions: {
      runScripts: false,
      resources: false,
      freezeGlobals: false,
      pretendToBeVisual: true,
    },

    // verbose output
    verbose: false,
  },
}
```

## Run tests

Tests run on compiled (.js) files.

```sh
# node testin-nutin/runner.js
npm run test # needs a build output

# npm run build && node testin-nutin/watch-tests.js
npm run test:watch # NOTE: will rerun all tests on change.

# npm run build && npm run test
npm run test:rebuild
``` 

Accepts filter arguments *ex: e2e, unit, FILE_NAME*.     

## Built-in features (minimalistic)

- *Test globals* : describe, it, beforeEach/All, afterEach/All.

- *Assertions library* : `toBe`, `toEqual`, `toContain`, `toBeDefined`, `toBeUndefined`, `toBeTruthy`, `toBeFalsy`, `toBeInstanceOf`, `toHaveBeenCalled`, `toHaveBeenCalledWith`, `toBeLessThan`, `toBeGreaterThan`, `toThrow`.                
All assertions can be used with their `not.` counterpart.

```js
expect(2+2).toBe(4);
expect(2+2).not.toBe(5);
```

- *spyOn* 

```js 
spyOn(obj, methodName) 
restore()
get calls()
get callCount()
get lastCall()
andCallFake(fn)
andReturn(value)
```

- *JSDOM initial setup for DOM testing*.

- *Automated tests discovery* : Recursively scans paths in `nutin.config.js`'s `testinNutin.origins` array for .test.js files.

- Add new paths in `nutin.config.js`'s `testinNutin.origins` array.                    
- *mini-chalk* to color console outputs.

## How to use

Syntax is very similar to Jest, only with (way) less features.               
Import statements from 'dist' folder can be simplified by adding `"imports": { "#root/*.js": "./*.js" }` in package.json, then use `#root/dist/src`. Group exports in barrel files (`index.ts`).

## Quick orientation

* Testing toolkit requires the TypeScript code to be compiled first. `"imports": {"#root/*.js": "./*.js"}` is meant to be used in test files only, to shorten long relative paths.
* Runner exposes global helpers: `describe`, `it`, `expect`, `beforeEach`, `afterEach`, `beforeAll`, `afterAll`.
* JSDOM globals:
```js
global.window
global.document

// DOM globals
Object.getOwnPropertyNames(dom.window)
  .filter(prop => !(prop in global))
  .forEach(prop => {
    global[prop] = dom.window[prop];
})

global.localStorage
// browser APIs
window.matchMedia
window.scrollTo
window.requestAnimationFrame
window.cancelAnimationFrame
window.IntersectionObserver
window.ResizeObserver

// called after each test
teardownJsdom()

// globals
global.setupJsdom
global.teardownJsdom
global.resetDom
global.flushPromises

global.$ = (selector) => {}
global.$$ = (selector) => {}

global.click = (el) => {}
global.type = (el, text) => {}
```
* Runs in **Node + jsdom**.

* Built-in `spyOn` utility.

* CLI: `npm run test` (runs single-run), `npm run test:watch` (watch mode) and `npm run test:rebuild` (builds and runs single-run).

## Basic syntax (describe / it / expect)

```js
describe('sum()', () => {
  it('adds two numbers', () => {
    const res = sum(1, 2);
    expect(res).toBe(3);
  });
});
```

* `describe(name, fn)` groups tests.

* `it(name, fn)` / `test(name, fn)` defines a test case.

* `expect(value)` returns a matcher object: `toBe`, `toEqual`, `toContain`, `toBeDefined`, `toBeUndefined`, `toBeInstanceOf`, `toHaveBeenCalled`, `toHaveBeenCalledWith`, `toBeLessThan`, `toBeGreaterThan`, `toBeFalsy`, `toBeTruthy`, `toThrow`.

* matcher objects all have a `not` counterpart (`expect(value).not.toBe('not-expected')`).

* extend matcher in `testin-nutin/core/src/globals/assertion-lib.js`.

## Mocks

`testin-nutin/mocks/` provides ready-made test doubles for the framework's core services, each built on the shared `createMockMethod()` helper (spy-like, with `.calls`, `.mockReset()`, etc.):

* `mock-http-client.js` — `MockHttpClient` (mocked `get`/`post`/`put`/`patch`/`delete`, plus `reset()`)
* `mock-event-bus.js` — `MockEventBus` (mocked `subscribe`, real pass-through `emit` that invokes registered handlers)
* `mock-i18n.js` — `MockI18n`
* `mock-router.js` — `MockRouter`
* `create-mock-method.js` — the underlying spy factory used by all of the above

## Where to look in code

* `testin-nutin/core/src/globals/` - assertion library, globals, spyOn, JSDOM.
* `testin-nutin/mocks/` - mock service doubles for tests (see [Mocks](#mocks)).
* `testin-nutin/core/src/utils/` - queue class, test-discovery, test-queue, print (chalk-like util + output helper functions).
* `testin-nutin/core/tests` - testing assertions and globals.
* `testin-nutin/runner.js` - runner.

***The test runner uses a Queue data structure, for which all credit goes to ThePrimeagen and his [amazing Data Structures and Algorithms course on frontendmasters.com](https://frontendmasters.com/courses/algorithms/)***
