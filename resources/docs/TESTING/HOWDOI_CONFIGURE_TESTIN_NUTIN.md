# How do I configure testin-nutin?

`testinNutin` block in `nutin.config.js`:

```js
testinNutin: {
    includeFramework: true,  // Test Nutin source - src/core
    includeTools: false,     // Test tools/ (builder, testin-nutin, etc.)
    includeApp: false,       // Include application tests

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

See [How do I run tests?](HOWDOI_RUN_TESTS.md).
