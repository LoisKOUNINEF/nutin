# Test matrix

See [`PLAN.md`](./PLAN.md) for methodology (why full combinatorial, fix-as-you-go, environment gotchas). This file is the concrete matrix.

## Current CLI shape (verify before relying on it)

Source of truth: `packages/nutin/lib/src/common/feature-registry.mjs` (FEATURES), `lib/src/create-app/context-builder.mjs` (presets/flag composition), `lib/src/common/package-json-helper.mjs` (generated scripts). As of version 2.0.0:

- **FEATURES**: `accessibilityComponents` (cli: `accessibility-components`), `forms`, `overlays`, `nutinMixins` (cli: `nutin-mixins`), `docker`. Dependency chain — enforced in `lib/src/add-feature/feature-adder.mjs`, **not** in the registry itself: `forms`/`overlays` → require `accessibilityComponents` → requires `nutinMixins`.
- **`create-nutin-app` / `nutin-new`**: `[projectName] -pm <npm|yarn|pnpm|bun> --libs --docker --preset <default|full>`. `default` = everything off (used if `--preset` omitted). `full` = all 4 lib features + docker on. `--libs`/`--docker` override whatever the preset set.
- **`nutin-add <feature|libs|all>`**: `feature` = any FEATURES `.cli` value; `libs` = all 4 lib features; `all` = every feature including docker.
- **`nutin-update [-y] [--from <path>]`**: 3-way diff (old template render vs new template render vs what's actually on disk) driven by `.nutin-meta.json`'s recorded version.
- **`i18n` / `tailwind` / `inlineTemplates` are NOT CLI flags.** Pure post-generation hand-edits to `nutin.config.js`, which is a fully static file (no Handlebars conditionals at all — every key is always present as a plain boolean default, developer-toggled after scaffolding).
- **Generated scripts** (built programmatically in `package-json-helper.mjs`, no `package.json.hbs` template): `build`, `build:prod`, `serve`, `serve:only`, `dev`, `generate`, `testin-nutin`, `testin-nutin:watch`, `testin-nutin:only`, `testin-nutin:coverage`. `docker:build`/`docker:run`/`patch`/`minor`/`major` only when `docker` is on. **No `lint` script exists.**
- `build` = `tsc` only (unbundled, dev). `build:prod` = esbuild bundle + hash + compress + SSR SEO generation (if `builder.generateSEO`), no `tsc`. `dev` and every `testin-nutin` variant except `:only` run `build` first. Tests import from **compiled** `dist/src/...`, never `.ts` source.

## Dimension A — creation flags × package manager

16 cells: `{libsOn, dockerOn} × {npm, yarn, pnpm, bun}`.

| libs | docker | flags |
|---|---|---|
| off | off | `--preset default` (or no flags) |
| on | off | `--preset default --libs` |
| off | on | `--preset default --docker` |
| on | on | `--preset full` |

For each of the 4 combos × 4 package managers:

```bash
<cli> my-app-<combo>-<pm> -pm <pm> <flags>   # create-nutin-app / nutin-new
cd my-app-<combo>-<pm>
<pm> run build
<pm> run build:prod
<pm> run testin-nutin
<pm> run testin-nutin:coverage
```

(`<cli>` = however you're invoking the CLI — global install, `npx @nutin/cli`, or `node packages/nutin/bin/create-app.mjs` from a repo checkout.)

## Dimension B — script smoke coverage

On the full-preset (libs+docker on) app for each of the 4 package managers, reused from Dimension A:

- `<pm> run dev` — builds once, then starts live-server + a chokidar watcher. Verify it serves, and that editing a `src/` file triggers a rebuild the watcher/server picks up. (See `PLAN.md`'s environment note if your sandbox kills processes on port bind.)
- `<pm> run serve` (build + `serve:only`).
- `<pm> run generate <component|service|view> <name>` — run **non-interactively** (piped/empty stdin) against a `nutin.config.js` where `generator.generateTest`/`testinNutin.includeApp`/`i18n` are deliberately mismatched (e.g. `generateTest: true` but `includeApp: false`), to confirm the non-TTY guard skips the affected file with a warning instead of hanging.
- `<pm> run docker:build` (only present when `docker` is on) — confirm the image builds; no need to run the container.

## Dimension C — post-generation `nutin.config.js` toggles

8 cells: `{i18n, tailwind, inlineTemplates} × {true, false}`, hand-edited directly in a generated app's `nutin.config.js` (never wired to a CLI flag). Apply on top of a full-preset app (most surface area): `build` + `build:prod` on every combo; additionally run `testin-nutin` on the all-off baseline, the all-on combo, and the i18n-only combo (i18n affects router/service behavior at runtime, worth confirming tests still pass). Cross-check the all-off and all-on combos once more on a bare (no libs/docker) app, to confirm the toggles behave independently of which lib features are installed.

**Known non-bug:** `tailwind: true` will correctly fail `build`/`build:prod` unless `tailwindcss`/`@tailwindcss/cli` are installed as devDependencies first — the CLI never auto-adds them (it's a manual toggle), and the build exits 1 with the exact install command in non-TTY mode rather than hanging. Install those two packages before testing this combo for real, or treat the guarded failure as expected and move on.

**Highest-value combo, always test explicitly (don't rely on it falling out of the 8-way sweep):** `i18n: true` + `inlineTemplates: true` + `tailwind: true` together, on `build:prod` specifically. This exact combination has previously crashed SSR/SEO route generation (a `parseHTML(...)` call missing a `location` option) in a way narrower combos didn't surface.

## Dimension D — `nutin-add` flows

On fresh bare (no libs/docker) apps:

- Each of the 5 features added standalone: `nutin-add accessibility-components`, `nutin-add forms`, `nutin-add overlays`, `nutin-add nutin-mixins`, `nutin-add docker`.
- Both add-orderings for features that share dependencies: `forms` then `overlays`, and `overlays` then `forms` — confirm no duplicate barrel/config entries where `accessibilityComponents`/`nutinMixins` get pulled in by both.
- `nutin-add libs` shortcut and `nutin-add all` shortcut.
- Re-add idempotency: run the same `nutin-add <feature>` twice on one app — the second run should warn + skip, not duplicate barrel lines or config blocks.
- Structural check: diff the `nutin-add libs` result against a `--preset full` app (minus docker) from Dimension A, excluding `node_modules/`, `.git/`, `dist*/`, `.nutin-meta.json`, lockfiles — the two should match.
- Each resulting app: `build` → `build:prod` → `testin-nutin`.

## Dimension E — `nutin-update` flows

- **No-op update**: run `nutin-update` on a freshly generated, unmodified current-version app — expect "already up to date," no conflicts reported.
- **User-modified-file conflict detection**: hand-edit a base template file post-generation that you know differs between an older template checkout and the current one (check with `git diff <old-commit> -- packages/nutin/templates/base/<file>` first — a byte-identical file will be silently classified "unchanged upstream, skip" instead of conflicting, which is correct but not what you're testing for). Run `nutin-update --from <path-to-older-templates-checkout>`. Confirm the modified file is flagged as a conflict with an accurate unified diff written to `NUTIN-UPDATE-REPORT.md`, while untouched-and-changed-upstream files are auto-applied and new-upstream files are added.
- **Missing `.nutin-meta.json` bootstrap**: delete the file, run `nutin-update`, confirm it falls back to an interactive prompt reconstructing version + feature flags, then proceeds normally. Can be driven non-interactively via piped stdin with raw escape sequences (`\x1b[B` down, `\x20` toggle, `\r` enter) if scripting this.
- **Major-version-mismatch refusal**: hand-edit `.nutin-meta.json`'s recorded version to an older major than the installed CLI, confirm `nutin-update` refuses with a clear message. (A recorded version *newer* than the installed CLI hits a different, equally valid "installed CLI is older than what this project records" guard — pick a genuinely older major if you're specifically testing the major-version-refusal path, not that other one.)

## Regression checklist

Confirm each of these **empirically** (a real scratch-app build, not a template read) — every one was a real, previously-fixed bug in this codebase, and the class of bug (a flag name or relative path silently drifting out of sync between two files during a refactor) tends to recur:

- `src/styles/main.scss`'s libs conditional gates on the real per-feature context keys (`accessibilityComponents`/`forms`/`overlays`/`nutinMixins`), not a nonexistent combined `libs` flag — check `dist/src/main.css` actually contains lib CSS on a `--libs`/`--preset full` app (not just reset-only output).
- `nutinMixins` enabled alone, with no other lib feature, still produces a working SASS build (its shared `_nutin-config.scss` must be generated even when nutinMixins is the only lib feature on).
- An app with `i18n: true` produces a working `build:prod` (SSR/SEO route rendering is the historical crash site — see Dimension C).
- `create-nutin-app -pm pnpm` succeeds on pnpm ≥10 with default settings (auto-recovers from `ERR_PNPM_IGNORED_BUILDS` rather than hard-failing).
- `<pm> run generate` with non-TTY stdin and a config/flag mismatch (e.g. `generateTest: true` + `testinNutin.includeApp: false`) skips the affected file with a warning instead of hanging indefinitely.
- A bun-generated app (`bun.lock`, the modern text lockfile — not only the legacy `bun.lockb`) keeps `packageManager: "bun"` in `.nutin-meta.json` after a `nutin-add` call, instead of being misdetected and flipped to `"npm"`.
- testin-nutin's runner/globals/coverage files all import config from `#root/nutin.config.js` — not a nonexistent standalone `#root/testin-nutin.config.js`.
- `tools/generator/generator.js` in a generated app is valid, executable JS (no leftover invalid Handlebars syntax like `{{#if !x}}`, which isn't legal Handlebars).
- The `overlays` feature's blocking-loader component imports `SpinnerComponent` from the real `accessibility-components` barrel path, not a nonexistent `overlays/components/spinner/...` path.
- `builder.config.js` is actually generated into every scaffolded app (several `tools/builder/**` files import it — confirm it exists and the build doesn't crash on a missing-module error).
