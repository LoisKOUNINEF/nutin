# How do I run tests?

The test environment loads the **built development output** (not bundled nor minified) `dist/src/index.html` into jsdom.

```bash
# Commands support file filter
<pm> run testin-nutin # Build and runs test suites
<pm> run testin-nutin:watch # Watch mode
<pm> run testin-nutin:coverage # Run test coverage
<pm> run testin-nutin:verbose # Print test suites and individual tests
```

See [How do I write a test?](./HOWDOI_WRITE_A_TEST.md).
