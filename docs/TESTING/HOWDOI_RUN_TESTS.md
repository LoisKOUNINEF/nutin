# How do I run tests?

The test environment loads the **built development output** (not bundled nor minified) `dist/src/index.html` into jsdom.

```bash
# Commands support file filter
<pm> run testin-nutin           # build, then run once
<pm> run testin-nutin:watch     # build once, then re-run on file changes
<pm> run testin-nutin:coverage  # run and outputs coverage.
<pm> run testin-nutin:verbose   # run and log each test suite and test as it runs
```

See [How do I write a test?](./HOWDOI_WRITE_A_TEST.md).
