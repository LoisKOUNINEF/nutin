# How do I write a test?

- **Note:** Every generated app's `package.json` gets an `"imports": { "#root/*.js": "./*.js" }`
entry, so test files can write `import { foo } from '#root/path/to/foo.js'`.

## File discovery

Files matching `*.test.js`, anywhere under a configured origin directory, are
discovered automatically (see [How do I configure testin-nutin?](./HOWDOI_CONFIGURE_TESTIN_NUTIN.md)). 

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

- `describe(name, fn)` / `it(name, fn)` — **no `test()` alias**, only `it`.
- `beforeAll` / `beforeEach` / `afterEach` / `afterAll` — one hook of each
  kind per suite; declaring a second one in the same `describe` silently
  overwrites the first (no stacking/composition).
- DOM helpers: `$(selector)` / `$$(selector)` (`querySelector`/
  `querySelectorAll` shorthands), `click(el)`, `type(el, text)`.
- `setupJsdom` / `teardownJsdom` / `resetDom` / `flushPromises` / `silenceConsole` are also
  exposed as globals if a test needs to manage the DOM environment directly.

See [What assertions are available?](./WHAT_ASSERTIONS_ARE_AVAILABLE.md).
