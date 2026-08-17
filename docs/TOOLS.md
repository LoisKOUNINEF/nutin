# Tools Docs

## Table of Contents

- [Package.json scripts](#packagejson-scripts)
- [Project layout](#project-layout)
- [SEO files generation](#seo-files-generation)
- [Builder](#builder)
- [Core script](#core-script)
- [Dev script](#dev-script)
- [Generator](#generator)

## Package.json scripts

* Development server :
*NOTE: If you switch package manager in an existing nutin app, you'll need to modify : `tools/dev/dev-serve.js`, `tools/dev/watcher.js`.*

```bash
# build (dev environment) and serve
<pm> run serve

# without build (use existing 'dist' output)
<pm> run serve:only

<pm> run dev
```

There are no `--bundle`/`--log` CLI flags — build mode and log verbosity are controlled elsewhere:
* Dev vs. production output is decided by `NODE_ENV` (set by the `build:prod` script below), not a flag on `serve`/`dev`/`build`.
* Verbosity is controlled by `builder.logLevel` in `nutin.config.js` (`0` = start/finish only, `1` = steps, `2` = everything).

* Build for production:

```bash
<pm> run build:prod
# runs: NODE_ENV=production node tools/builder/builder.js
```

* Generate a component, view or service:

```bash
# kebab-case name
# supports nested path
<pm> run generate ELEMENT ELEMENT_NAME

##
<pm> run generate component my-component
<pm> run generate view my-view
<pm> run generate service my-service
```

- Runs generator: `<pm> run generate component widgets/my-widget` -> this creates: 
    - `src/app/components/widgets/my-widget/my-widget.component.ts`.
    - `src/app/components/widgets/my-widget/my-widget.component.html`, if `nutin.config.js`'s `inlineTemplates` is `false`.
    - `src/app/components/widgets/my-widget/locales/*.json`, if `nutin.config.js`'s `generator.generateLocales` is `true` (requires the `i18n` feature).
    - `src/app/components/widgets/my-widget/my-widget.component.scss`, if `nutin.config.js`'s `generator.generateStylesheet` is `true` (co-located next to the `.ts` file — no `styles/components/` barrel anymore).
    - it also appends an `export * from './widgets/my-widget/my-widget.component.js';` line to the nearest `index.ts` barrel (`appendToIndex` — see below).

* Run tests (testin-nutin toolkit, shipped in base — no feature flag needed):

```bash
<pm> run testin-nutin        # build, then run once
<pm> run testin-nutin:only   # run only, using the existing dist/ build
<pm> run testin-nutin:watch  # build once, then re-run on file changes
```

* Versioning and Docker (only if the `docker` feature is enabled):

```bash
<pm> run patch
<pm> run minor
<pm> run major

<pm> run docker:build
<pm> run docker:run
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
tools/  -- builder, dev, generator, testin-nutin (deployment lives under tools/deployment/ with the docker feature)
nutin.config.js
package.json
tsconfig.json
```

## SEO files generation

`config/seo.json` - enabled in `nutin.config.js -> generateSEO`.

```json
{
  "baseUrl": "https://my-website.com",
  "disallowBots": [],
  "routes": [ /* ... */ ]
}
```

### Route fields

| Field | Required | Type | Notes |
|---|---|---|---|
| `path` | yes | `string` | Must match a key in `src/app/routes.ts`'s `appRoutes`; dynamic segments use `:param` (`:param?` for optional). |
| `title` | yes | `string \| { [lang]: string }` | A flat string applies to every language uniformly; use a per-language object to localize. |
| `description` | yes | `string \| { [lang]: string }` | Same rules as `title`. |
| `ogImage` | no | `string \| { [lang]: string }` | Only written into `og:image`/`twitter:image` when present — omit to leave those tags out entirely. |
| `mockParams` | required if `path` has dynamic segments | `{ [param]: string }` | One representative value per dynamic segment, used to SSR-render that route at build time; missing one is a build-time `exit(1)`. |
| `mockFetch` | no | `{ [url]: jsonBody }` | Exact-URL-keyed map — any `fetch(url)` call made while SSR-rendering this route that matches a key resolves to `jsonBody` instead of hitting the network. For views that fetch data on mount. |
| `disallow` | no | `true \| string[]` | `true` blocks this path for every bot in `robots.txt`; an array of bot names blocks it only for those bots. |

### Examples

- Default (i18n disabled)

```json
{
  "baseUrl": "https://my-app.com",
  "disallowBots": ["GPTBot"],
  "routes": [
    {
      "path": "/",
      "title": "My App — Home",
      "description": "Welcome to My App.",
      "ogImage": "/assets/images/og-cover.jpg"
    },
    {
      "path": "/blog/:slug",
      "title": "My App — Blog",
      "description": "Read the latest posts.",
      "mockParams": { "slug": "hello-world" },
      "mockFetch": { "/api/posts/hello-world": { "title": "Hello World", "body": "..." } }
    }
  ]
}
```

- i18n enabled

`nutin.config.js`'s `i18n: true`, `config/languages.json` listing `en`+`fr`. One
route is fully localized; the other is left flat on purpose - will trigger a warning

```json
{
  "baseUrl": "https://my-app.com",
  "disallowBots": [],
  "routes": [
    {
      "path": "/",
      "title": { "en": "My App — Home", "fr": "Mon App — Accueil" },
      "description": { "en": "Welcome to My App.", "fr": "Bienvenue sur Mon App." },
      "ogImage": "/assets/images/og-cover.jpg"
    },
    {
      "path": "/blog/:slug",
      "title": "My App — Blog",
      "description": "Read the latest posts.",
      "mockParams": { "slug": "hello-world" }
    }
  ]
}
```

`ogImage` stays flat even on the localized route.

## Builder

### Build flow

`tools/builder/builder.js` is the orchestrator (executable Node script). It runs a fixed sequence of core steps (in this order):

1. `copy-static.js`
    — copy files from `src/` into `dist-build/src/` (assets/static + JSONs), the favicon, and `config/`/`nutin.config.js`, respecting known binary extensions.
2. `validate-routes.js`
    — statically parse `src/app/routes.ts`'s `appRoutes` object literal (TypeScript compiler API, no execution) and fail the build if any route key is duplicated (an earlier duplicate would be silently unreachable).
3. *dev builds only* : `tsc.js`
    — run the TypeScript compiler.
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
    - rename dist-build to dist
    - *production*: remove unused folder beforehand.

### Core script

#### `core/copy-static.js`

* Purpose:
    - copy files into `dist-build/src/` while handling binary files and JSON files specially; also copies `public/favicon.ico` and the `config/`/`nutin.config.js` files into the build output.
* Uses: `tools/builder/variables/binary-extensions.js` (set of known binary extensions) and `tools/utils/get-files-recursive.js`.
* If you add new asset formats, update `binary-extensions.js`.

#### `core/validate-routes.js`

* Purpose: catch duplicate route keys in `src/app/routes.ts` before they cause a silently unreachable route at runtime.
* Behavior: statically parses `appRoutes`'s object literal with the TypeScript compiler API (the file is never executed) and exits with an error listing every duplicated key.

#### `core/build-i18n.js`

* Only if i18n feature is used.
* Purpose: merge many small locale JSON files scattered under `src/app` into unified locale files under `dist-build/src/locales/<lang>.json`.
* Behavior:
    - It uses `getFilesRecursive(sourceRoot, '.json')` to find JSON files.
    - It groups JSON files by filename (the filename without `.json` is considered the locale code — e.g. `en.json`, `fr.json`).
    - It then removes the original JSON fragments under `dist-build/src/app` (calling `removeJsonFiles(cleanupDir)`).
* If no locale JSONs are present, the step will effectively do nothing (no files created).

#### `core/merge-templates.js`

* Only if `inlineTemplates` is `false` (external templates).
* Purpose: inject external HTML templates into JS files by replacing `__TEMPLATE_PLACEHOLDER__` tokens.
* Behavior:
  * The script operates on `dist-build/src/app`. It looks for `foo.html foo.js` in the app tree.
  * For each matching HTML / JS file, it reads the HTML, minifies it, and writes the HTML string where the placeholder was found.
* The component & view generator creates TS files with the literal `__TEMPLATE_PLACEHOLDER__`.

* If you don't provide external `.html` files, the templateFn / template content will remain and the component/view will render it.

#### `core/sass.js`

* Scans paths defined in `nutin.config.js`'s `sass.paths`.
* Compiles `src/styles/main.scss` into `dist-build/src/main.css`, then recursively finds and appends every `.scss` file co-located under `src/app/components` and `src/app/views`.
* Add new scss folder paths in `nutin.config.js` if needed.

#### `core/validate-html.js`

* Purpose: inject the main script tag and main stylesheet ref, then run a few checks on HTML before finishing the build.
* Behavior : it reads `index.html` file, add app's entrypoint script tag and stylesheet link tag, validates tags and errors out if expected nodes are missing.

#### `core/esbuild.js`

Runs esbuild with config derived from `nutin.config.js`.

#### `core/hash-files.js`

Hash `.js` and `.css` files.

#### `core/compress-files.js`

Compress files with gzip (`.js` `.css` `.json` `.svg` `ttf` `otf` `eot`).                                     
*Note: Uncomment Brotli compression if you intend to use it.*

#### `core/generate-seo-html.js`

* HTML generation: per-route/lang static `index.html` with real SSR content and meta tags, `robots.txt` generation, `sitemap.xml` generation.
* Any real route in `src/app/routes` with no matching entry in `config/seo.json` gets a warning. `/404`, `/403`, `/500` get a quieter "probably intentional" note. Never fatal.
* Missing language object are never fatal (warn only)
* Hard failures: missing `mockParams`, empty value (e.g. `"title": ""`), unexpected
  error. Exits the whole build with code 1.

#### `core/finalize-build.js`

* If production build (esbuild) : removes unnecessary folders from `dist-build` and `nutin-config.js`.
* Removes exisiting (if any) `dist` folder.
* Renames `dist-build` to `dist`.

## Dev script

See [Package.json scripts](#packagejson-scripts) above for the `dev` / `serve` / `serve:only` commands. This section covers what each file in `tools/dev/` does.

### `dev-serve.js`

* Purpose: orchestrates the full dev-mode flow — one full build, then the static server and file watcher together.
* Behavior: runs `<packageManager> run build`, then runs `<packageManager> run serve:only` and `node tools/dev/watcher.js` concurrently via `Promise.all`.

### `serve.js`

* Purpose: serves the built `dist/src` output with `live-server` (port `9090`).
* Behavior: custom middleware gives SPA fallback — any request whose URL doesn't look like a static asset (no `.` in the last path segment) is rewritten to `/index.html` so client-side routing works.

### `watcher.js`

* Purpose: watches `src/` for changes and triggers a rebuild.
* Behavior: uses `chokidar` to watch `src` (ignoring dotfiles), debounces changes (100ms), and guards against overlapping builds while one is already running. Rebuilds by running `<packageManager> run build`.

## Generator

* Usage: `<pm> run generate TYPE PATH/TO/NAME`).
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
* *If external templates are used* `html.template.js` — minimal HTML snippet: `<div>{Name} works !</div>`.
* *If `generator.generateLocales` is on* : `json.template.js` — default i18n JSON
* `scss.template.js` — currently a no-op stub (`() => '\n'`); styles are hand-authored, not scaffolded with boilerplate.
* *If `generator.generateTest` is on* : `test.template.js` — minimal `.test.js` file.

**Notes**

* Generator-produced components and views intentionally include the `__TEMPLATE_PLACEHOLDER__` token. This is by design: the build step `merge-templates.js` uses this token to inject HTML templates into those files.
* *If `generator.generateStylesheet` is on* : The generator writes a (currently blank) `.scss` file co-located next to the component/view's own `.ts` file
* *If `generator.generateLocales` is on* : The generator also creates locale fragments when — it relies on `LANGUAGES` from `config/languages.json` at your project root.
