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
	core/  -- toolkit's code
	libs/  -- toolkit's libraries
	styles/
	index.html
tools/  -- builder, generators
package.json
tsconfig.json
```

## Builder

### Goals & features

* Fast dev builds with file-watching and live reload.
* Compile TypeScript -> JS (ES target configurable).
* Compile SASS -> CSS, support for global + component styles.
* Simple bundling (concatenate or minimal bundler) tuned for small apps.


### Build flow

`tools/builder/builder.js` is the orchestrator (executable Node script). It runs a fixed sequence of core steps (in this order):

1. `./core/copy-static.js` — copy files from `src/` into `dist-build/src/` (assets/static + JSONs) respecting known binary extensions.
2. *If i18n feature has been enabled on app creation* : `./core/build-i18n.js` — find JSON locale fragments and merge them into per-locale files under `dist-build/src/locales/`.
3. *If external template feature has been enabled on app creation* : `./core/merge-templates.js` — replace `__TEMPLATE_PLACEHOLDER__` tokens in built JS with actual HTML templates (from `.html` files found in the app output tree).
4. `./core/sass.config.js` — compile `src/styles/main.scss` and write `dist-build/src/main.css`.
5. `./core/validate-html.js` — run lightweight checks over `public/index.html` (and/or `index.html` in `dist-build`) to ensure required tags exist.
6. Prints `Build successful!` (unless it isn't).

## Detailed notes on each core script

### `core/copy-static.js`

* Purpose:
- copy `src/` files into `dist-build/src/` while handling binary files and JSON files specially.
- *If external template feature has been enabled on app creation* : copy `src/` files into `dist/src/` while handling binary files and JSON files specially.
* Uses: `tools/builder/variables/binary-extensions.js` (set of known binary extensions) and `tools/utils/get-files-recursive.js`.
* Behavior :

  * Creates `dist-build/src/` as the target.
  * Recursively traverses `src/` and copies files.
  * Copies JSON files in a way that preserves folder structure (there is an internal `copyJsonFiles` helper); used bt i18n feature.
  * Skips or handles binary files according to the `BINARY_EXTENSIONS` set.

**What this means for you**

* If you add new asset formats, update `binary-extensions.js`.
* The script expects a `src/` tree and will place results into `dist-build/src/`.

### `core/build-i18n.js`

* Present only if i18n feature has been enabled on app creation.
* Purpose: merge many small locale JSON files scattered under `src/app` into unified locale files under `dist-build/src/locales/<lang>.json`.
* Behavior:

  * It uses `getFilesRecursive(sourceRoot, '.json')` to find JSON files.
  * It groups JSON files by filename (the filename without `.json` is considered the locale code — e.g. `en.json`, `fr.json`).
  * For each locale it combines multiple JSON sources (the code calls a `combineJsonFiles(files)` helper) and writes the combined result to `dist-build/src/locales/<locale>.json`.
  * It then removes the original JSON fragments under `dist-build/src/app` (calling `removeJsonFiles(cleanupDir)`).

**Implications / usage**

* To enable i18n in the production build you must keep locale fragment `.json` files in your `src/app` tree (naming them by locale — `en.json`, `fr.json`, etc.). The build step will merge them.
* If no locale JSONs are present, the step will effectively do nothing (no files created).

### `core/merge-templates.js`

* Present only if external template feature has been enabled on app creation.
* Purpose: inject external HTML templates into JS files by replacing `__TEMPLATE_PLACEHOLDER__` tokens.
* Behavior:

  * The script operates on `dist-build/src/app` (constant `JS_DIR`). It looks for `.html` files and for JS files that contain the `__TEMPLATE_PLACEHOLDER__` token.
  * For each matching HTML file it reads the HTML, minifies it, and writes a replacement into the corresponding JS module (writing the HTML string where the placeholder was found).
* Important detail: the component & view generator templates create JS/TS files with the literal `__TEMPLATE_PLACEHOLDER__` in them (see `tools/generator/templates/component.template.js` and `view.template.js`) — this is the hook used by `merge-templates.js`.

* Workflow expectation:

  1. Build / transpile your TypeScript sources so that the generated JS is in `dist-build/src/app`.
  2. Ensure your `.html` templates exist with paths/names that `merge-templates.js` can discover (it searches the built app tree for `.html` files).
  3. Run the builder (which runs `merge-templates.js` as part of the sequence). The script will replace `__TEMPLATE_PLACEHOLDER__` in JS files with the actual HTML strings.
* If you don't provide external `.html` files, the templateFn / template content will remain and the component/view will render it.

### `core/sass.config.js`

* Purpose: compile `src/styles/main.scss` into a single `dist-build/src/main.css` using `sass` (`sass.compileAsync`).
* Behavior : it writes the final CSS to build folder and logs when complete.

### `core/validate-html.js`

* Purpose: run a few checks on HTML before finishing the build.
* Behavior : it reads an `index.html` file and validates tags and errors out if expected nodes are missing.

### `core/esbuild.js`

Runs esbuild with config from `builder.config.js`.

### `core/finalize-build.js`

* If production build (esbuild) : removes unnecessary folders from `dist-build`.
* Removes exisiting (if any) `dist` folder.
* Renames `dist-build` to `dist`.

## Generator tool (scaffolding)

Files: `tools/generator/generator.js`, `tools/generator/handle-file.js`, `tools/generator/templates/*`

### CLI contract (what the shipped `generator.js` expects)

* Usage: `node tools/generator/generator.js <type> <path>` (or via npm script wrapper `npm run generate TYPE PATH/TO/NAME`).
* `type` is a string (`component` || `view` || `service`).
* `path` is a target path where files will be created; the script normalizes / extracts the last word to derive the `name`. If the name is provided with no path, files will be created in `TYPE_FOLDER/NAME/NAME.ts` 

### What `handle-file.js` does

* `generateFile({ name, targetPath, templateFn, suffix, extension = 'ts' })` — creates the target directory and writes a file `${targetPath}/${name.kebab}.${suffix}.${extension}` using `templateFn(name, targetPath)` as content.
* `generateJson({ targetPath, name })` — creates a `locales` directory beneath the target and writes JSON files for each language present in `src/app/languages.js`'s exported `LANGUAGES` array. For `view` targets, *if i18n feature has been enabled on app creation*, the JSON template includes `meta` keys; for other targets a minimal default JSON is written.

### Templates shipped

* `component.template.js` — creates a TypeScript component class that imports `Component` from `core/index.js` (relative path computed by `getRelToCore`) and sets `const templateFn = () => \'__TEMPLATE\_PLACEHOLDER__\';\`.
* `view.template.js` — similar to component but for `View`; sets `const template = \'__TEMPLATE\_PLACEHOLDER__\';\`.
* `service.template.js` — simple singleton `Service` pattern.
* *If external templates feature has been enabled on app creation* `html.template.js` — minimal HTML snippet (*If i18n feature has been enabled on app creation* : references i18n key by kebab name: `<div data-i18n="<name>.default"></div>`).
* *If i18n feature has been enabled on app creation* : `json.template.js` — basic view JSON that includes a `meta` section and default string.

**Key generator implications**

* *If external templates feature has been enabled on app creation* : Generator-produced components and views intentionally include the `__TEMPLATE_PLACEHOLDER__` token. This is by design: the build step `merge-templates.js` uses this token to inject HTML templates into those files after the TypeScript -> JS transformation.
* *If i18n feature has been enabled on app creation* : The generator will also create locale fragments when `generateJson` is invoked — but it relies on `LANGUAGES` exported from your project (the generator imports `../../src/app/languages.js`). If that file doesn't exist in your project, the generator will throw.
* *If stylin-nutin feature has been enabled on app creation* : The component generator will ask for a `.scss` file creation in `styles/components`.