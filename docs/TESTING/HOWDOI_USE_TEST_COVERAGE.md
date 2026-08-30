# How do I use test coverage?

## Usage

- via command line:
```bash
<pm> run testin-nutin:coverage
```

- via `nutin.config.js`:

```js
testinNutin: {
    // ...
    coverage: {
      enabled: false,        // Set to true to make it the default behavior in plain '<pm> run testin-nutin' command
      threshold: 95,         // see "Threshold" below
      reportUncovered: true, // see "Files output" below
    },
}
```

## How does coverage work

Coverage is real V8 precise coverage, collected via `node:inspector`'s
`Profiler` API (`core/coverage/collect-coverage.js`).

### Scope

- When `includeFramework` (default: `true`): `(dist)/src/core`
- When `includeApp` (default: `false`): `(dist)/src/app` 
- **`tools/` is never counted into coverage**.

## Metrics

Three metrics are computed per file, each intentionally lightweight rather than exact:

- **Lines** — samples the execution count at each line's first
  non-whitespace character; not full statement-level coverage.
- **Functions** — every V8-reported function range except the
  whole-script pseudo-function.
- **Branches** — every V8 range nested inside a function's own top-level
  range (`if`/`else` arms, ternaries, `switch` cases, `&&`/`||`
  short-circuits, loop bodies) — reuses data V8 already collects, no AST
  parsing involved.

### Threshold

If `testinNutin.coverage.threshold` is a number and any global metric
(lines/functions/branches) falls below it, the process exits with code 1
after printing which metric(s) missed and by how much — useful as a CI gate.

## Output

### Console output

Console output is a per-file `console.table` *(paths are shown with a cosmetic
`.ts` extension, though coverage is measured against the compiled `.js`)*
plus a global `branches/functions/lines %` summary line.

### Files output

- `coverage/summary.md` is written **unconditionally** on every coverage run
that produces a non-empty report — the test summary (pass/fail/todo/total/time,
same numbers `printSummary` already prints for every run), the per-file
table, and the global percentages (plus the threshold), all
persisted as a standing artifact.

- If `testinNutin.coverage.reportUncovered` is true and anything is
uncovered, `coverage/uncovered.md` is written listing uncovered
lines/branches/functions per file. **Line numbers in that report
refer to the compiled `dist/src/[core, app]/*.js` output, not the original `.ts` source.**
