# Nutin - Tools documentation

***IMPORTANT NOTE:*** 

Switching package manager in an existing nutin app requires adapting: 

- **breaking**: `tools/dev/dev-serve.js`
- **breaking**: `tools/dev/watcher.js`
- *cosmetic*: `tools/generator/generator.js` and `tools/builder/builder.js`
- **breaking**: `tools/docker/Dockerfile` *(with docker feature already added)*

## Table of Contents

- [Package.json scripts](#packagejson-scripts)
- [Generator](#generator)
- [Builder](#builder)

## Package.json scripts

* Development server :

```bash
# build (dev environment) and serve
<pm> run serve

# build (prod environment) and serve
<pm> run serve:prod

# without build (use existing 'dist' output)
<pm> run serve:only

# build (dev environment) and serve with live reload
<pm> run dev
```

* Build for production:

```bash
<pm> run build:prod
# runs: NODE_ENV=production node tools/builder/builder.js
```

* Generate a component, view or service:

```bash
<pm> run generate ELEMENT ELEMENT_NAME
```

* Run tests (testin-nutin toolkit, shipped in base — no feature flag needed):

```bash
<pm> run testin-nutin           # build, then run once
<pm> run testin-nutin:watch     # build once, then re-run on file changes
<pm> run testin-nutin:coverage  # run and outputs coverage. Fails if below threshold defined in nutin.config.js.testinNutin.coverage.threshold
```

* Docker (with docker feature added - `nutin-add docker`):

```bash
<pm> run docker:build
<pm> run docker:run
```

## Generator

* Usage: `<pm> run generate TYPE PATH/TO/NAME`).
* `type` is a string (`component` || `view` || `service`).
* `path` is a target path where files will be created; the script normalizes / extracts the last word to derive the `name`. Files will be created in `TYPE_FOLDER/PATH/TO/NAME/NAME.ts` or in `TYPE_FOLDER/NAME/NAME.ts` if only `name` was provided.

### Templates

* `component.template.js` — creates a TypeScript component class that imports `Component` from `core/index.js` (relative path computed by `getRelToCore`) and sets `const templateFn = () => '__TEMPLATE_PLACEHOLDER__';` (or the literal HTML if `inlineTemplates` is off).
* `view.template.js` — similar to component but for `View`; sets `const template = '__TEMPLATE_PLACEHOLDER__';`.
* `service.template.js` — simple singleton `Service` pattern.
* *If external templates are used* `html.template.js` — minimal HTML snippet: `<div>{Name} works !</div>`.
* *If `generator.generateLocales` is on* : `json.template.js` — default i18n JSON
* `scss.template.js` — currently a no-op stub (`() => '\n'`); styles are hand-authored, not scaffolded with boilerplate.
* *If `generator.generateTest` is on* : `test.template.js` — minimal `.test.js` file.

**Notes**

* Generator-produced components and views intentionally include the `__TEMPLATE_PLACEHOLDER__` token. This is by design: the build step `merge-templates.js` uses this token to inject HTML templates into those files.
* *If `generator.generateStylesheet` is on* : The generator writes a (currently blank) `.scss` file co-located next to the component/view's own `.ts` file
* *If `generator.generateLocales` is on* : The generator also creates locale fragments when — it relies on `LANGUAGES` from `config/languages.json` at your project root.

## Builder

* If you add new asset formats, update `tools/builder/app/binary-extensions.js`.

### Build flow

`tools/builder/builder.js` is the orchestrator (executable Node script). It runs a fixed sequence of core steps (in this order):

1. `copy-static.js`
    — copy files from `src/` into `dist-build/src/` (assets/static + JSONs), the favicon, and `config/`/`nutin.config.js`, respecting known binary extensions.
2. `validate-routes.js`
    — statically parse `src/app/routes.ts`'s `appRoutes` object literal (TypeScript compiler API, no execution) and fail the build if any route key is duplicated (an earlier duplicate would be silently unreachable).
3. `tsc.js`
    — run the TypeScript compiler.
    - eventhough it could be skipped for production build (using `esbuild`), it runs for Type checking.
4. *If `inlineTemplates` is `false`* : `merge-templates.js`
    — minify each external HTML template then replace the matching `.js` file's `__TEMPLATE_PLACEHOLDER__` token with it.
    *If `inlineTemplates` is `true`* : `minify-html.js`
    — minify inline templates in place instead.
5. `sass.js`
    — compile `src/styles/main.scss` (plus every component/view's co-located `.scss`) and write `dist-build/src/main.css`.
6. *If `tailwind` is configured* : `tailwind.js`
    — compile Tailwind CSS.
7. *If i18n is used* : `build-i18n.js`
    — find JSON locale fragments and merge them into per-locale files under `dist-build/src/locales/`.
8. `validate-html.js`
	- add app entrypoint script tag and stylesheet link tag in index.html
    — run lightweight checks over `dist-build/src/index.html` to ensure required tags exist.
9. *production only* : `esbuild.js`
    - run esbuild
10. *production only* : `hash-files.js`
    - hash `.js` and `.css` files
11. *production only* : `compress-files.js`
    - compress files with gzip (`.js` `.css` `.json` `.svg` `ttf` `otf` `eot`)
12. *production only, if `generateSEO` is enabled* : `generate-seo-files.js`
    - server-render each route to static HTML, plus `robots.txt`/`sitemap.xml` — see [SEO files generation](#seo-files-generation) for full behavior.
13. `finalize-build.js`
    - remove existing dist/ folder.
    - *production*: remove unused files and folders.
    - rename dist-build to dist
