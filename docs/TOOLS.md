# Tools Docs

## Package.json scripts

* Development server (SASS compile, TS compile):
*NOTE: If you switch package manager in an existing nutin app, you'll need to modify : `tools/dev.js`, `tools/watcher.js`.*

```bash
npm run serve

# without building
npm run serve:only

# live reload
npm run dev
```

* Build for production:

```bash
npm run build:prod
# or
npm run build --bundle
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

Runs generator: `npm run generate component widgets/my-widget` -> this creates: 
- `src/app/components/widgets/my-widget/my-widget.component.ts`.
- `locales` fragments with i18n feature enabled.
- `src/app/components/widgets/my-widget/my-widget.component.html` with external templates feature enabled. 
- optionally `styles/components/_my-widget.scss` with stylin-nutin feature enabled (forwarded by `styles/components/_index.scss`).

* Run tests (testin-nutin toolkit):

```bash
npm run test
npm run test:rebuild
npm run test:watch
```

* Versioning

```bash
npm run patch
npm run minor
npm run major
```

## Project layout

```
public/
src/
	app/
	  components/
	    my-component/
	      my-component.ts
	      my-component.html
	  services/
	  	my-service/
	  		my-service.ts
	  views/
	    home/
	      home.ts
	      home.html
  	routes.ts
  	main.ts
	assets/
	core/  -- nutin's code
	libs/  -- nutin's libraries
	styles/
	index.html
tools/  -- builder, deployment, dev, generator
builder.config.js
package.json
tsconfig.json
```

## Builder

### Build flow

`tools/builder/builder.js` is the orchestrator (executable Node script). It runs a fixed sequence of core steps (in this order):

1. `copy-static.js` 
    — copy files from `src/` into `dist-build/src/` (assets/static + JSONs) respecting known binary extensions.
2. *If i18n is used* : `build-i18n.js` 
    — find JSON locale fragments and merge them into per-locale files under `dist-build/src/locales/`.
3. `minify-html.js` 
    - Minify html inline templates. 
    - *when using external templates* : `merge-templates.js` — minify HTML template then replace `__TEMPLATE_PLACEHOLDER__` tokens with minified template.
4. `sass.js` 
    — compile `src/styles/main.scss` and write `dist-build/src/main.css`.
5. `validate-html.js` 
     — run lightweight checks over `public/index.html` (and/or `index.html` in `dist-build`) to ensure required tags exist.
6. `esbuild.js`
    - 
7. Finalize build
    - remove existing dist/ folder.
    - rename dist-build to dist
    - *production*: remove unused folder beforehand.

## Core script

### `core/copy-static.js`

* Purpose:
    - copy files into `dist-build/src/` while handling binary files and JSON files specially.
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

* Only if external template are used.
* Purpose: inject external HTML templates into JS files by replacing `__TEMPLATE_PLACEHOLDER__` tokens.
* Behavior:
  * The script operates on `dist-build/src/app`. It looks for `foo.html foo.js` in the app tree.
  * For each matching HTML / JS file, it reads the HTML, minifies it, and writes the HTML string where the placeholder was found.
* The component & view generator creates TS files with the literal `__TEMPLATE_PLACEHOLDER__`.

* If you don't provide external `.html` files, the templateFn / template content will remain and the component/view will render it.

### `core/sass.js`

* Scans paths defined in `builder.config.js`.
* Compile `src/styles/main.scss` into a single `dist-build/src/main.css` using `sass` (`sass.compileAsync`).
* Add new .sccs folder paths in builder.config.js if needed.

### `core/validate-html.js`

* Purpose: run a few checks on HTML before finishing the build.
* Behavior : it reads an `index.html` file and validates tags and errors out if expected nodes are missing.

### `core/esbuild.js`

Runs esbuild with config from `builder.config.js`.

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
* `generateJson({ targetPath, name })` 
    — creates a `locales` directory beneath the target and writes JSON files for each language present in `src/app/languages.js`'s exported `LANGUAGES` array. For `view` targets, *if i18n feature is used*, the JSON template includes `meta` keys; for other targets a minimal default JSON is written.

### Templates

* `component.template.js` — creates a TypeScript component class that imports `Component` from `core/index.js` (relative path computed by `getRelToCore`) and sets `const templateFn = () => \'__TEMPLATE\_PLACEHOLDER__\';\`.
* `view.template.js` — similar to component but for `View`; sets `const template = \'__TEMPLATE\_PLACEHOLDER__\';\`.
* `service.template.js` — simple singleton `Service` pattern.
* *If external templates are used* `html.template.js` — minimal HTML snippet (*If i18n is used* : references i18n key by kebab name: `<div data-i18n="<name>.default"></div>`).
* *If i18n is used* : `json.template.js` — basic JSON
* `scss.template.js` — `@use` variables, mixins, and sass:map.

**Notes**

* *If external templates are used* : Generator-produced components and views intentionally include the `__TEMPLATE_PLACEHOLDER__` token. This is by design: the build step `merge-templates.js` uses this token to inject HTML templates into those files.
* *If stylin-nutin is used* : The generator will ask for a `.scss` file creation in `styles/components` / `styles/view` (forwarded by `_index.sccs` barrel files.
* *If i18n is used* : The generator will also create locale fragments when `generateJson` is invoked — but it relies on `LANGUAGES` exported from your project (the generator imports `config/languages.json` from root). If that file doesn't exist in your project, the generator will throw.