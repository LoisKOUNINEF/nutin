# How to use Jest or Vitest for app tests?

[testin-nutin](https://nutin.dev/docs/testing) and another runner can live side by side: testin-nutin keeps testing the framework (`src/core`) and `tools/`, and Jest or Vitest runs your app's tests.

Their globals don't conflict. testin-nutin's `describe`, `it`, `expect`, `spyOn`… exist only inside its own runner process, and it ships no type declarations, so `@types/jest` or Vitest's types have nothing to collide with.

What does conflict is **which files each runner picks up**. Both look for `*.test.js` by default, and a new Nutin app ships its own, written for testin-nutin (`src/core/**`, `tools/**`). Point the other runner at your app's tests only.

## Jest

```js
// jest.config.js
export default {
  roots: ['<rootDir>/src/app'],
};
```

Or keep the default roots and exclude Nutin's tests:

```js
export default {
  testPathIgnorePatterns: ['/node_modules/', '/src/core/', '/tools/', '/dist'],
};
```

## Vitest

```js
// vitest.config.js
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['src/app/**/*.test.{js,ts}'],
  },
});
```

## testin-nutin side

Keep `includeApp: false` (the default) in the `testinNutin` block of `nutin.config.js`, so testin-nutin doesn't run your Jest or Vitest tests. See [How do I configure testin-nutin?](https://nutin.dev/docs/testing/configure-testin-nutin).

## Important

- A test file is written for one runner. The global names are the same, but the APIs aren't: testin-nutin's `spyOn(obj, 'method').andCallFake()`, `setupJsdom()`, `$`/`$$`/`click()`, `silenceConsole()` and `useFakeTimers()` don't exist in Jest or Vitest, and testin-nutin has no `jest.fn()`/`vi.fn()`, no nested `describe()` and only the matchers listed in [What assertions are available?](https://nutin.dev/docs/testing/what-assertions-are-available).
- testin-nutin's tests import the compiled output (`#root/dist/...`), so they run after a build. Jest and Vitest run your sources instead, so TypeScript and ES modules go through their own setup.
