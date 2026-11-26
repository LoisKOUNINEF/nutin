# Builder

## Usage 

```bash
# Build application
<pm> run build

# Build application for production
<pm> run build:prod

# Type-check only (TypeScript projects), without building
<pm> run typecheck
```

`typecheck` runs the steps `tsc` needs and nothing else: copy the files into `dist-build`, merge the HTML templates, then `tsc --noEmit` with the `data-event` handler references (see "Compile TypeScript" below). `dist/` is left as it is, and `dist-build` is removed when the check passes (a failed check leaves it, like a failed build; the next run clears it). It exits with `tsc`'s errors and a non-zero code otherwise. Use it in CI rather than a plain `tsc --noEmit`, which doesn't see the merged templates and reports every `private` handler used only in a template as unused (`noUnusedLocals`; declare handlers `protected`).

## Steps

### Setup

- Copy files in temporary `dist-build` directory: the sources, every file in `public/` (served from the site's root) and every file under `src/assets/`, whatever their type. `.DS_Store`, `Thumbs.db` and `.gitkeep` files are left out. Don't use `app/`, `core/`, `config/` or (in an extension) `extension/` as top-level folders in `public/`: those names hold the copied sources, which production builds and extension packages leave out.
- *with the markdown feature:* compile the `markdownSources` folders into `/generated/*.json` manifests

### Base steps

- Add tags to `index.html` (script, stylesheet) and validate it. It must contain an `id="app"` element when the app uses the router (the router mounts views into it) or `generateSEOFiles` (pages are prerendered into it).
- Validate application routes - fail if duplicates are found. Skipped when no app code imports `routes.ts` and `generateSEOFiles` is off: an app that mounts its components without the router needs no routes file.
- Merge HTML templates: each `.html` template goes into its component or view, in place of `__TEMPLATE_PLACEHOLDER__`
- Compile TypeScript (type-checking only in production). It runs on the merged files, so the expressions in `.html` templates are type-checked too; errors are reported at their `.html` file and line. `tsc` runs on `dist-build` through a generated `dist-build/tsconfig.json` that extends yours (removed at the end of the build)
- Minify HTML templates
- Compile styles *(including Tailwind CSS with `tailwind` option enabled)*
- *with i18n option enabled:* Merge locales into a single `.json` file
- Run esbuild: bundles the app into `bundle.js` (minified in production). Each dynamic `import()` becomes a separate chunk in `chunks/`, only downloaded the first time it runs; that's how [lazy routes](../API/VIEWS_AND_ROUTING/HOWDOI_REGISTER_A_ROUTE.md#lazy-routes) work. Code shared by several chunks goes into its own chunk too.

### Production-only steps

- Before esbuild: write a content-hashed copy of each translations and Markdown manifest file, `locales/<lang>.<hash>.json` and `generated/<id>.<hash>.json`, next to the plain one, which is kept. The bundle fetches the hashed copy: a file that changes gets a new URL, so it can be cached for good.
- Hash `bundle.js` and `main.css`, the two files `index.html` references (`chunks/` names are already hashed by esbuild; files copied from `public/` and `src/assets/` keep their names)
- *with generateSEOFiles option enabled:* Generate static `.html` files for routes configured in `config/seo.json`
- Compress files in Gzip (`.gz`) and Brotli (`.br`) formats, last, so prerendered pages, `index.html`, `sitemap.xml` and `robots.txt` are compressed too (the copied sources aren't)
- Remove unused folders and `nutin.config.js`.

### Browser extension projects

- *with `--extension`:* after esbuild (and hashing, in production), write one unpacked extension per browser in `extension.browsers` into `dist/<browser>`: the built page and assets (without the copied sources), `background.js` (bundled from `src/extension/background.ts` with `builder.esbuild`'s settings) and `manifest.json` (version from `package.json`, Firefox's derived from Chrome's). Nothing is compressed. See [How do I create a browser extension?](../CLI/HOWDOI_CREATE_A_BROWSER_EXTENSION.md)

### Final step

- Rename `dist-build` to `dist`

## Tabs left open across a deploy

A tab opened before a deploy still runs the previous build, so it may request a hashed file that the new deploy no longer has:
- **Translations and Markdown manifests** are then fetched from their plain URL (`/locales/<lang>.json`, `/generated/<id>.json`), which every build keeps. Switching language or opening a Markdown page keeps working, with no reload.
- **A lazy route's chunk** gets a full page load of the target URL, which fetches the new build.
- **An `import()` the app doesn't catch** (a component's lazy module) gets a full page load of the current URL.
- These page loads happen once per URL within 10 seconds, and never while the browser is offline: if the file keeps failing, the error is only logged. An `import()` error your code catches is left to it.

**Trade-off**: after falling back to the plain files, the old tab runs the previous build's code with the new build's translations and manifests. In practice that's harmless: a key the old templates don't use is ignored, and a key they use that's gone falls back to the element's own text, then to the key itself.

## Build-time constants

The builder passes esbuild these `define`s (`tools/builder/core/prod-bundle/bundle-options.js`). esbuild replaces each one with its value, so a check on one becomes a constant, and the code it guards is left out of the bundles where it can't run.

| Constant | Value | Bundles | Used for |
|---|---|---|---|
| `globalThis.__NUTIN_PROD__` | `true` in prod, `false` in dev | browser only | Dev-only diagnostics: a check wrapped in `if (!globalThis.__NUTIN_PROD__)` is left out of prod bundles, with the work that builds its message. The SSR bundle doesn't get it, so prerendering keeps them. |
| `globalThis.__NUTIN_I18N__` | `i18n` is on | browser, SSR, extension worker | The i18n code is left out when i18n is off. |
| `globalThis.__NUTIN_SEO__` | `generateSEOFiles` is on | browser, SSR, extension worker | The seo.json title lookup is left out without `generateSEOFiles`. |
| `globalThis.__NUTIN_DATA_FILES__` | JSON string: each runtime JSON file's content-hashed URL (`{}` in dev) | browser, SSR, extension worker | `dataFileUrl()` and `fetchDataFile()` (see [Tabs left open across a deploy](#tabs-left-open-across-a-deploy)). |
| `globalThis.__NUTIN_MARKDOWN_SOURCES__` | JSON string: the markdown feature's `markdownSources.sourceFolders` | browser, SSR, extension worker | The markdown feature's runtime, so `markdownSources` itself stays out of the bundle. |
| `process.env.NODE_ENV` | `"production"` in prod, `"development"` in dev | browser, SSR, extension worker | Libraries that read it. Core doesn't, and generated projects have no `@types/node` to type it: use `__NUTIN_PROD__` in app code. |

They're declared in `src/core/internals.d.ts`, except the markdown one, which the markdown feature declares itself. Outside a bundle (in tests, and in the `tsc` output testin-nutin runs) they're undefined. So read them with a fallback, as core does: `globalThis.__NUTIN_I18N__ ?? CONFIG.i18n`, or `!globalThis.__NUTIN_PROD__` for code that should also run in tests.

Two things decide whether esbuild can leave the code out:
- **Wrap the guarded code, don't return early.** esbuild drops `if (false) { … }`, but not the code after an `if (true) return;`.
- **Booleans fold; arrays and objects don't.** esbuild hoists an array or object `define` into a shared variable, so `define ?? fallback` keeps the fallback. That's why the two lists above are JSON strings, read with `JSON.parse(globalThis.__NUTIN_X__ ?? '…')`.

## Notes

- You can configure SASS paths to be compiled in `nutin.config.js`.
- You can configure ESBuild options in `nutin.config.js`.
- Class fields and `#private` members are bundled as written, whatever `builder.esbuild.target` says. Nutin's core uses them, and lowered for an older target each field would become a helper call and each `#private` member a `WeakMap` lookup. This needs Safari 15, Chrome 84, Firefox 90 or later. To support older browsers, list the features to lower for your target in the optional `builder.esbuild.lowerClassFeatures` (an unknown name stops the build):
    ```js
    esbuild: {
      target: ['es2020'],
      lowerClassFeatures: ['class-field', 'class-private-field', 'class-private-method'],
    },
    ```
    The features are `class-field`, `class-static-field`, `class-private-field`, `class-private-method`, `class-private-accessor`, `class-private-static-field`, `class-private-static-method`, `class-private-static-accessor` and `class-private-brand-check`. An entry in esbuild's own `builder.esbuild.supported` takes precedence over it.
- The browser bundle only gets the runtime part of `nutin.config.js`: the tooling-only keys (`builder`, `testinNutin`, `dockerPorts`, `markdownSources`) are left out.
- If you need new asset formats to be included in the built output, add them in `tools/builder/app/binary-extensions.js`.
