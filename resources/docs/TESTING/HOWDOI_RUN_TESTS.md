# How do I run tests?

The test environment loads the **built development output** (not bundled nor minified) `dist/src/index.html` into jsdom.

```bash
# Commands support file filter (except :watch)
<pm> run testin-nutin           # build, then run once
<pm> run testin-nutin:only      # run once, without rebuilding
<pm> run testin-nutin:watch     # build and run on every file change
<pm> run testin-nutin:coverage  # run and outputs coverage.
<pm> run testin-nutin:verbose   # run and log each test suite and test as it runs
```

`testin-nutin:watch` watches `src/` (and `tools/` with `includeTools`), including added and deleted files, and rebuilds before each run.

See [How do I write a test?](./HOWDOI_WRITE_A_TEST.md).
