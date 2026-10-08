# Builder

## Usage 

```bash
# Build application
<pm> run build

# Build application for production
<pm> run build:prod
```

## Steps

### Setup

- Copy files in temporary `dist-build` directory
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

- Hash files (except `chunks/`, whose names esbuild already hashes, and the copied `src/app`/`src/core` sources)
- *with generateSEOFiles option enabled:* Generate static `.html` files for routes configured in `config/seo.json`
- Compress files in Gzip (`.gz`) and Brotli (`.br`) formats, last, so prerendered pages, `index.html`, `sitemap.xml` and `robots.txt` are compressed too (the copied sources aren't)
- Remove unused folders and `nutin.config.js`.

### Final step

- Rename `dist-build` to `dist`

## Notes

- You can configure SASS paths to be compiled in `nutin.config.js`.
- You can configure ESBuild options in `nutin.config.js`.
- The browser bundle only gets the runtime part of `nutin.config.js`: the tooling-only keys (`builder`, `testinNutin`, `dockerPorts`, `markdownSources`) are left out.
- If you need new asset formats to be included in the built output, add them in `tools/builder/app/binary-extensions.js`.
