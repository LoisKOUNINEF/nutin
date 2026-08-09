# Tools Docs

## Package.json scripts

* Development server :
*NOTE: If you switch package manager in an existing nutin app, you'll need to modify : `tools/dev/dev-serve.js`, `tools/dev/watcher.js`.*

```bash
# build (dev environment) and serve
npm run serve

# without build (use existing 'dist' output)
npm run serve:only

npm run dev
```

There are no `--bundle`/`--log` CLI flags — build mode and log verbosity are controlled elsewhere:
* Dev vs. production output is decided by `NODE_ENV` (set by the `build:prod` script below), not a flag on `serve`/`dev`/`build`.
* Verbosity is controlled by `builder.logLevel` in `nutin.config.js` (`0` = start/finish only, `1` = steps, `2` = everything).

* Build for production:

```bash
npm run build:prod
# runs: NODE_ENV=production node tools/builder/builder.js
```

* Generate a component, view or service:

```bash
# kebab-case name
# supports nested path
npm run generate ELEMENT ELEMENT_NAME

##
npm run generate component my-component
npm run generate view my-view
npm run generate service my-service
```

- Runs generator: `npm run generate component widgets/my-widget` -> this creates: 
    - `src/app/components/widgets/my-widget/my-widget.component.ts`.
    - `src/app/components/widgets/my-widget/my-widget.component.html`, if `nutin.config.js`'s `inlineTemplates` is `false`.
    - `src/app/components/widgets/my-widget/locales/*.json`, if `nutin.config.js`'s `generator.generateLocales` is `true` (requires the `i18n` feature).
    - `src/app/components/widgets/my-widget/my-widget.component.scss`, if `nutin.config.js`'s `generator.generateStylesheet` is `true` (co-located next to the `.ts` file — no `styles/components/` barrel anymore).
    - it also appends an `export * from './widgets/my-widget/my-widget.component.js';` line to the nearest `index.ts` barrel (`appendToIndex` — see below).

* Run tests (testin-nutin toolkit, only if the `testinNutin` feature is enabled):

```bash
npm run test
npm run test:rebuild
npm run test:watch
```

* Versioning and Docker (only if the `deployHelper` feature is enabled):

```bash
npm run patch
npm run minor
npm run major

npm run docker:build
npm run docker:run
```

## Project layout

```
public/
src/
	app/
	  components/
	    my-component/
	      my-component.component.ts
	      my-component.component.html
	  services/
	  	my-service/
	  		my-service.service.ts
	  views/
	    home/
	      home.view.ts
	      home.view.html
  	routes.ts
  	main.ts
	assets/
	core/  -- nutin's code
	libs/  -- nutin's libraries
	styles/
	index.html
tools/  -- builder, dev, generator (deployment lives under tools/deployment/ with the deployHelper feature)
nutin.config.js
package.json
tsconfig.json
```

## Builder

### Build flow

`tools/builder/builder.js` is the orchestrator (executable Node script). It runs a fixed sequence of core steps (in this order):

1. `copy-static.js`
    — copy files from `src/` into `dist-build/src/` (assets/static + JSONs), the favicon, and `config/`/`nutin.config.js`, respecting known binary extensions.
2. *dev builds only* : `tsc.js`
    — run the TypeScript compiler.
3. *If `inlineTemplates` is `false`* : `merge-templates.js`
    — minify each external HTML template then replace the matching `.js` file's `__TEMPLATE_PLACEHOLDER__` token with it.
    *If `inlineTemplates` is `true`* : `minify-html.js`
    — minify inline templates in place instead.
4. *If i18n is used* : `build-i18n.js`
    — find JSON locale fragments and merge them into per-locale files under `dist-build/src/locales/`.
5. `sass.js`
    — compile `src/styles/main.scss` (plus every component/view's co-located `.scss`) and write `dist-build/src/main.css`.
6. *If `tailwind` is configured* : `tailwind.js`
    — compile Tailwind CSS.
7. `validate-html.js`
	- add app entrypoint script tag and stylesheet link tag in index.html
    — run lightweight checks over `dist-build/src/index.html` to ensure required tags exist.
8. *production only* : `esbuild.js`
    - run esbuild
9. *production only* : `hash-files.js`
    - hash `.js` and `.css` files
10. *production only, if `generateSEO` is enabled* : `generate-seo-html.js`, `generate-robots-txt.js`, `generate-sitemap-xml.js`
    - server-render each route to static HTML for SEO, plus generate `robots.txt` and `sitemap.xml` (see `tools/builder/core/ssr/` for the underlying SSR bundle/render/polyfill scripts).
11. *production only* : `compress-files.js`
    - compress files with gzip (`.js` `.css` `.json` `.svg` `ttf` `otf` `eot`)
12. `finalize-build.js`
    - remove existing dist/ folder.
    - rename dist-build to dist
    - *production*: remove unused folder beforehand.

## Core script

### `core/copy-static.js`

* Purpose:
    - copy files into `dist-build/src/` while handling binary files and JSON files specially; also copies `public/favicon.ico` and the `config/`/`nutin.config.js` files into the build output.
* Uses: `tools/builder/variables/binary-extensions.js` (set of known binary extensions) and `tools/utils/get-files-recursive.js`.
* If you add new asset formats, update `binary-extensions.js`.

### `core/build-i18n.js`

* Only if i18n feature is used.
* Purpose: merge many small locale JSON files scattered under `src/app` into unified locale files under `dist-build/src/locales/<lang>.json`.
* Behavior:
    - It uses `getFilesRecursive(sourceRoot, '.json')` to find JSON files.
    - It groups JSON files by filename (the filename without `.json` is considered the locale code — e.g. `en.json`, `fr.json`).
    - It then removes the original JSON fragments under `dist-build/src/app` (calling `removeJsonFiles(cleanupDir)`).
* If no locale JSONs are present, the step will effectively do nothing (no files created).

### `core/merge-templates.js`

* Only if `inlineTemplates` is `false` (external templates).
* Purpose: inject external HTML templates into JS files by replacing `__TEMPLATE_PLACEHOLDER__` tokens.
* Behavior:
  * The script operates on `dist-build/src/app`. It looks for `foo.html foo.js` in the app tree.
  * For each matching HTML / JS file, it reads the HTML, minifies it, and writes the HTML string where the placeholder was found.
* The component & view generator creates TS files with the literal `__TEMPLATE_PLACEHOLDER__`.

* If you don't provide external `.html` files, the templateFn / template content will remain and the component/view will render it.

### `core/sass.js`

* Scans paths defined in `nutin.config.js`'s `sass.paths`.
* Compiles `src/styles/main.scss` into `dist-build/src/main.css`, then recursively finds and appends every `.scss` file co-located under `src/app/components` and `src/app/views`.
* Add new scss folder paths in `nutin.config.js` if needed.

### `core/validate-html.js`

* Purpose: inject the main script tag and main stylesheet ref, then run a few checks on HTML before finishing the build.
* Behavior : it reads `index.html` file, add app's entrypoint script tag and stylesheet link tag, validates tags and errors out if expected nodes are missing.

### `core/esbuild.js`

Runs esbuild with config derived from `nutin.config.js`.

### `core/hash-files.js`

Hash `.js` and `.css` files.

### `core/compress-files.js`

Compress files with gzip (`.js` `.css` `.json` `.svg` `ttf` `otf` `eot`).                                     
*Note: Uncomment Brotli compression if you intend to use it.*

### `core/finalize-build.js`

* If production build (esbuild) : removes unnecessary folders from `dist-build`.
* Removes exisiting (if any) `dist` folder.
* Renames `dist-build` to `dist`.

## Generator

* Usage: `npm run generate TYPE PATH/TO/NAME`).
* `type` is a string (`component` || `view` || `service`).
* `path` is a target path where files will be created; the script normalizes / extracts the last word to derive the `name`. Files will be created in `TYPE_FOLDER/PATH/TO/NAME/NAME.ts` or in `TYPE_FOLDER/NAME/NAME.ts` if only `name` was provided.

### What `handle-file.js` does

* `generateFile({ name, targetPath, templateFn, suffix, extension = 'ts' })` 
    — creates the target directory and writes a file `${targetPath}/${name.kebab}.${suffix}.${extension}` using `templateFn(name, targetPath)` as content.
* `appendToIndex({ name, targetPath, suffix })`
    — after writing the file, appends `export * from './...';` to the nearest `index.ts` barrel (three path segments up from `targetPath`, e.g. `src/app/components/index.ts`) so newly generated files are automatically re-exported.
* `generateJson({ targetPath, name })` — invoked when `nutin.config.js`'s `generator.generateLocales` is `true` (requires the `i18n` feature)
    — creates a `locales` directory beneath the target and writes JSON files for each language present in `config/languages.json`'s `LANGUAGES` array. For `view` targets, the JSON template includes `meta` keys; for other targets a minimal default JSON is written.

### Templates

* `component.template.js` — creates a TypeScript component class that imports `Component` from `core/index.js` (relative path computed by `getRelToCore`) and sets `const templateFn = () => '__TEMPLATE_PLACEHOLDER__';` (or the literal HTML if `inlineTemplates` is off).
* `view.template.js` — similar to component but for `View`; sets `const template = '__TEMPLATE_PLACEHOLDER__';`.
* `service.template.js` — simple singleton `Service` pattern.
* *If external templates are used* `html.template.js` — minimal HTML snippet: `<div>{Name} works !</div>` (no `data-i18n` scaffolding, regardless of whether i18n is enabled).
* *If `generator.generateLocales` is on* : `json.template.js` — default JSON
* `scss.template.js` — currently a no-op stub (`() => '\n'`); styles are hand-authored, not scaffolded with boilerplate.

**Notes**

* *If external templates are used* : Generator-produced components and views intentionally include the `__TEMPLATE_PLACEHOLDER__` token. This is by design: the build step `merge-templates.js` uses this token to inject HTML templates into those files.
* *If `generator.generateStylesheet` is on* : The generator writes a (currently blank) `.scss` file co-located next to the component/view's own `.ts` file — there's no separate `styles/components`/`styles/views` barrel to forward it through anymore.
* *If `generator.generateLocales` is on* : The generator also creates locale fragments when `generateJson` is invoked — it relies on `LANGUAGES` from `config/languages.json` at your project root. If that file doesn't exist in your project, the generator will throw.
