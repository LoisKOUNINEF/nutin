# How do I write a test?

- **Note:** Every generated app's `package.json` gets an `"imports": { "#root/*.js": "./*.js" }`
entry, so test files can write `import { foo } from '#root/path/to/foo.js'`.

## File discovery

Files matching `*.test.js`, anywhere under a configured origin directory, are
discovered automatically (see [How do I configure testin-nutin?](./HOWDOI_CONFIGURE_TESTIN_NUTIN.md)). 

Tests are plain JavaScript, also in TypeScript projects: they import the compiled output (`#root/dist/...`), so they aren't type-checked. 

## Global API

Installed before any test file loads:

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

- `describe(name, fn)` / `it(name, fn)`. `test(name, fn)` is an alias of `it`.
- `it.todo(name)` lists a pending test in the report.
- `it.skip(name, fn)` / `describe.skip(name, fn)`: the test, or every test of the
  suite, is not run and is listed as `SKIPPED`. A suite whose tests are all skipped
  runs none of its hooks. The summary counts them: `⏭ Skipped: N`.
- `it.only(name, fn)` / `describe.only(name, fn)`: while any test of the run is
  marked `.only`, every other test is skipped (counted, not listed) and the summary
  warns `⚠️ .only is active`. Remove it before committing. While it's in, a coverage
  threshold fails too, since most code doesn't run.
- `beforeAll` / `beforeEach` / `afterEach` / `afterAll`: one hook of each
  kind per suite; declaring a second one in the same `describe` silently
  overwrites the first (no stacking/composition).
- DOM helpers: `$(selector)` / `$$(selector)` (`querySelector`/
  `querySelectorAll` shorthands), `click(el)`, `type(el, text)`.
- `setupJsdom` / `teardownJsdom` / `resetDom` / `flushPromises` / `silenceConsole` are also
  exposed as globals if a test needs to manage the DOM environment directly.

See [What assertions are available?](./WHAT_ASSERTIONS_ARE_AVAILABLE.md).

## Custom elements

Every test file runs in the same Node process, and each suite gets a fresh jsdom
window. A module runs only once per process, so a custom element package (e.g.
a11y-elements' `define.js`) defines its elements in one window only: the window
that was current when it was first imported. In any other window its elements stay
plain, un-upgraded elements (no properties or methods). The tests then pass or fail
depending on which file loads the package first.

List those test files in `testinNutin.isolate.files` (`nutin.config.js`):

```js
testinNutin: {
  isolate: {
    loadTimeout: 30,
    files: ['views/game/', 'views/bonus/'],
  },
}
```

The files alone work too: `isolate: ['views/game/', 'views/bonus/']`, and `loadTimeout` is optional.

Each matching file runs in its own worker thread, with its own modules and one jsdom
window. The window is shared by the file's import and all its suites. Between suites,
the document is put back as `index.html` loaded it, and `localStorage` is cleared.
Its results, `.only` and coverage count with the rest of the run.

Each isolated file loads jsdom again, which adds a few hundred milliseconds.
The workers run in parallel, but keep the list to the files that need it.
A file that hasn't loaded after `isolate.loadTimeout` seconds (30 by default) is reported as failed to load.
