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

`typecheck` runs the steps `tsc` needs and nothing else: copy the files into `dist-build`, merge the HTML templates, then `tsc --noEmit` with the `data-event` handler references (see "Compile TypeScript" below). `dist/` is left as it is, and `dist-build` is removed when the check passes (a failed check leaves it, like a failed build; the next run clears it). It exits with `tsc`'s errors and a non-zero code otherwise. Use it in CI rather than a plain `tsc --noEmit`, which doesn't see the merged templates and reports every handler used only in a template as unused (`noUnusedLocals`).

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

- Hash `bundle.js` and `main.css`, the two files `index.html` references (`chunks/` names are already hashed by esbuild; files copied from `public/` and `src/assets/` keep their names)
- *with generateSEOFiles option enabled:* Generate static `.html` files for routes configured in `config/seo.json`
- Compress files in Gzip (`.gz`) and Brotli (`.br`) formats, last, so prerendered pages, `index.html`, `sitemap.xml` and `robots.txt` are compressed too (the copied sources aren't)
- Remove unused folders and `nutin.config.js`.

### Browser extension projects

- *with `--extension`:* after esbuild (and hashing, in production), write one unpacked extension per browser in `extension.browsers` into `dist/<browser>`: the built page and assets (without the copied sources), `background.js` (bundled from `src/extension/background.ts` with `builder.esbuild`'s settings) and `manifest.json` (version from `package.json`, Firefox's derived from Chrome's). Nothing is compressed. See [How do I create a browser extension?](../CLI/HOWDOI_CREATE_A_BROWSER_EXTENSION.md)

### Final step

- Rename `dist-build` to `dist`

## Notes

- You can configure SASS paths to be compiled in `nutin.config.js`.
- You can configure ESBuild options in `nutin.config.js`.
- The browser bundle only gets the runtime part of `nutin.config.js`: the tooling-only keys (`builder`, `testinNutin`, `dockerPorts`, `markdownSources`) are left out.
- If you need new asset formats to be included in the built output, add them in `tools/builder/app/binary-extensions.js`.
