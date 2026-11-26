# How do I configure testin-nutin?

`testinNutin` block in `nutin.config.js`:

```js
testinNutin: {
    includeFramework: true,  // Test Nutin source - src/core
    includeTools: false,     // Test tools/ (builder, testin-nutin, etc.)
    includeApp: false,       // Include application tests
    isolate: [],             // Test files (path substrings) that each run in their own worker and jsdom window

    coverage: {
      enabled: false,        // Include coverage in the normal test command
      threshold: 95,         // Fail if any global coverage metric falls below this threshold
      reportUncovered: true, // Generate a report of uncovered lines, functions and branches
    },

    jsdomOptions: {
      runScripts: false,
      resources: false,
      freezeGlobals: false,
      pretendToBeVisual: true,
    },
}
```

`isolate` lists test files that need their own module graph, matched like the
runner's file filters (`'views/game/'` matches every test file under it). See
[Custom elements](./HOWDOI_WRITE_A_TEST.md#custom-elements).

See [How do I run tests?](HOWDOI_RUN_TESTS.md).
