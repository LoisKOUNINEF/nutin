# Changelog

## 3.0.0

### Breaking Changes

- **`HttpClient` URLs, bodies and responses**

    - URLs: endpoints are joined onto the base URL as URLs (not strings) and rejected before `fetch` when they leave its origin or path. Before, `${baseUrl}${endpoint}` let an endpoint like `@other.host/x` send the request and its default headers (e.g. `Authorization`) to another host. The base URL's own query is kept. Without a base URL, a relative endpoint now resolves against the page's origin, and default headers only go to that origin. Only `http:`/`https:` URLs are accepted. Error messages leave out query strings.
    - Encoded `/` and `\` (`%2F`, `%5C`) in a path are rejected, since servers often decode them into separators; list APIs that expect them in the new `trustedAPIs` option.
    - Bodies: `FormData`, `Blob`, `URLSearchParams`, binary data and streams are sent as they are (they used to be sent as `{}`); `0`/`false`/`''` are sent (they were dropped). `Content-Type: application/json` is only set for JSON bodies, so GET/DELETE no longer trigger a CORS preflight. Headers merge case-insensitively, and request interceptors get a `Headers` object.
    - Responses: 204/205 and empty bodies resolve to `undefined` (they threw); `+json` types are parsed (they were returned as text). Response interceptors get a clone, so reading its body no longer breaks the request.
    - Redirects: a followed redirect that ends outside the base URL (or, without one, on another origin than requested) now throws instead of returning that origin's response, and response interceptors don't see it. Browsers strip `Authorization` on cross-origin redirects but forward custom headers (e.g. `X-Api-Key`), so APIs using those should pass `redirect: 'error'`.

- **Templates are escaped at output**

    - New `html` tag, `raw()` and `trustedRaw()`. In an `html`... template, every `${}` is HTML-escaped, so data from any source renders as text and can't inject markup or `data-event`/`data-component` attributes. Nested `html` results are inserted as-is. Unquoted attribute values (`title=${x}`) are quoted automatically, so a value with spaces can't add attributes. `raw()` inserts HTML unescaped: at render it's parsed, stripped of Nutin's binding attributes and sanitized as nodes, so injected markup can't call component methods or mount children; in tag position (`<input ${raw('checked')}>`) it keeps only safe attributes; `trustedRaw()` keeps them, for markup you wrote yourself (the `markdown` feature uses it).
    - `data-optional="${value}"` still removes its element when `value` is `null`/`undefined`: in that attribute, `html` writes them as the literal strings the check looks for. Everywhere else they render as empty.
    - `html` checks URL attributes (`href`, `src`, `action`, `formaction`, `poster`, `background`, `xlink:href`) at every trust level, `trusted` included: a value from data that makes one a `javascript:` URL is replaced with `about:invalid#nutin-blocked`, with a warning in development. At `normal`/`strict` such a link now keeps an inert `href` instead of losing the attribute. A scheme written in the template itself (`href="/p/${id}"`) is left alone. New `SecurityHelper.isScriptUrl()`.
    - `raw()` inside `<textarea>`/`<title>` is inserted as text (entities decoded, tags shown as written, `<` escaped so it can't close the element), instead of showing a `<template data-nutin-raw>` placeholder. This also stops a `raw('</textarea>…')` from breaking out of the element in `String()` of the template. Nested `html` and `trustedRaw()` there are unchanged.
    - `String()` of a template with `raw()` no longer corrupts sources containing `$&`, `$1`, … (they were read as replacement patterns).
    - `data-event` tokens now pass raw values instead of HTML-escaped ones.
    - Removed `SecurityHelper.sanitizeInputElement()`.
    - The default `normal` trust level now also strips `srcdoc` attributes, SVG `<animate>`/`<set>` elements that rewrite a URL attribute and `javascript:` URLs. `data:` URLs are still stripped under `strict` only.
    - `normal` also strips `<style>`, `<link>`, `<base>` and `<meta>` elements, SVG `<script>`, and `data:`/`javascript:` documents in `<iframe>`/`<object>`/`<embed>`. Move styles a template carried inline into the component's `.scss`.
    - Rendering inserts the sanitized nodes directly instead of assigning the sanitized string to `innerHTML`. New `SecurityHelper.sanitizeToFragment()`; `sanitizeTemplate()` still returns a string.
    - Migration: tag each `template`/`templateFn` with `html` (`import { html } from core`), drop `.join('')` on mapped `html` results, and wrap markup you trust in `raw()`. The build warns about every untagged template that contains `${}`, since its values are no longer escaped anywhere.

- **Framework types are globals**

    - The public types are now declared in `src/core/internals.d.ts`, next to the event maps, and no longer exported from `core/index`: `ComponentConfig`, `BaseComponentOptions`, `ComponentOptions`, `ComponentProps`, `ViewOptions`, `CatalogConfig`, `CatalogItemConfig`, `CatalogItemObject`, `CatalogItemPrimitive`, `Template`, `TrustLevel`, `Routes`, `RouteGuard`, `RouteConfig`, `RouteMatch`, `IRouter`, `IEventBus`, `IHttpClient`, `IHttpClientOptions`, `IRequestConfig`, `QueryValue`, `HttpMethod`, `Language`, `Translations`, `PipeFunction`, `GlobalMountable`, `GlobalConfig`, `RegisterGlobalsOptions`, `Subscription`.
    - Migration: remove these names from your `import { … } from '…/core/index.js'` lines. Classes and functions (`Component`, `View`, `html`, `AppRouter`, …) are still imported as before.

- **No teardown on page unload**

    - Services no longer register a `beforeunload` listener, and the generated `main.ts` no longer calls `Service.destroyAll()` there. That teardown ran before the page was actually left: a page restored by Back from the back/forward cache, or kept after a cancelled "Leave site?" prompt, came back with every service disposed (no navigation, no translations, no HTTP interceptors). It also erased the saved language preference on every reload.
    - `dispose()`, `MyService.destroy()` and `Service.destroyAll()` now all run `registerCleanup` callbacks; before, only `dispose()` did.
    - Migration: delete the `window.addEventListener('beforeunload', …Service.destroyAll()…)` block from `src/app/main.ts`, along with its `Service` import if nothing else uses it (`nutin-update` doesn't touch `src/app`).

- **`data-event` only cancels navigation defaults**

    - A `data-event` handler now calls `preventDefault()` for link clicks (`<a href>`), form `submit` events and submit-button clicks inside a form, whether or not it takes arguments. Before, it was called once for each token argument, so it depended on the arguments: `keydown:_onKey:@key` blocked typing, `click:_toggle:@checked` unchecked the box again, and an argument-less `click:_go` on a link loaded the page. Call `@event`'s `preventDefault()` in your handler for any other default you relied on.
    - `TokenHelper.resolve()` no longer calls `preventDefault()`.

- **`nutin new`: `-p` replaces `-pm`**

    - The package manager flag is now `-p, --package-manager`, and only accepts `npm`, `yarn`, `pnpm` or `bun`. Any other value used to end up in the install command and in the generated scripts. `-pm` was a multi-letter short flag that newer Commander versions reject.

### Features

- **`nutin-update` reports `package.json`/`tsconfig.json` drift**

    - These files are written once at creation, so the template diff never covered them, and dependency bumps or new scripts never reached existing projects. The update summary now lists each generated `scripts`/`devDependencies` entry and `tsconfig.json` option that differs from what the installed nutin generates. They are listed only: nothing is written.

- **New `markdown` feature (`nutin-add markdown`)**

    - Compiles Markdown folders listed in `nutin.config.js`'s `markdownSources.sourceFolders` into `/generated/<name>.json` manifests at build time
    - Rendered by a `MarkdownView` with navigation and a table of contents. Each folder gets a route from `markdownRoutes()` (spread into `appRoutes`), and its manifest is loaded by that route's guard on first visit, through `MarkdownManifestsService` (`loadAll()` preloads every manifest). 
    - Adding a folder only takes a config change. Supports YAML frontmatter, hub (table of contents) files, sections in routes (`/docs/:section?/:slug?`) and internal links between pages. 
    - Duplicate slugs and broken links fail the build; content is validated before building. A page listed more than once in a folder's hub files (twice, or in two hubs) fails the build too. Hub entries may use `-`, `*` or `+` bullets; any other list item under `## Table of Contents` is ignored with a warning giving its line.
    - Heading ids turn accents into plain letters (`Été` → `ete`) and give a heading repeated on a page a `-1`, `-2`, ... suffix. Table of contents entries, page descriptions and hub descriptions are plain text: a description is the first paragraph or list item, without Markdown marks or HTML tags.
    - A folder whose manifest can't be loaded shows "This page couldn't be loaded." (new `loadError` locale key) instead of its empty state, and is tried again on the next visit.
    - Customizable from your own files: `markdownRoutes({ view })` builds each folder's view; `MarkdownView` takes `navComponent`, `contentComponent`, `landingComponent` (your own classes) and `onContentRendered(element, page)` (e.g. syntax highlighting), and its getters are protected. The nav, content and landing components take their template as an optional third constructor argument, and their render helpers are exported.
    - Easy to restyle: the feature's styles have no specificity (`:where()`), so any app rule wins, and sizes are custom properties on `.markdown-view` (`--markdown-gap`, `--markdown-nav-width`, `--markdown-toc-width`, `--markdown-line-height`). The nav no longer takes a fixed 16rem height when stacked on narrow screens.
    - `landing` folder option: the bare route shows an index of the folder (hub title, description, groups and pages; with `sectionInPath`, a landing per section) instead of its first page, prerendered and in the sitemap with `generateSEOFiles`. It's styled like the folder's pages (`.markdown-landing` and `.markdown-landing__body` share the content styles).
    - `ogImage` folder option: the default `og:image` of the folder's SEO pages.
    - In-app navigation sets `document.title` to the page's title, like its prerendered SEO page.
    - With `generateSEOFiles: true`, every page is prerendered at its own URL with its title, description and `og:image` (new frontmatter `ogImage`), and listed in `sitemap.xml`, with no `config/seo.json` entries needed. A `seo.json` route for the same URL overrides the generated one; `seo: false` on a folder opts it out. Descriptions taken from a page's first paragraph are plain text (no `[link](url)` or `**` marks).
    - i18n: with `i18n: true`, a folder with one subfolder per language (`markdown-content/en/`, `markdown-content/fr/`) is compiled to one manifest per language (`/generated/<name>.<lang>.json`). The default language defines the pages; a missing translation shows the default-language page and is listed in a build warning, and a page that only exists in a translation fails the build. Links carry the `/<lang>` prefix, a language change reloads the current page in the new language, and with `generateSEOFiles` every language gets its own SEO page with `hreflang` alternates. The feature's UI texts are translatable through `src/app/markdown/locales/<lang>.json`. Without i18n, nothing changes and no i18n code is bundled.

- **Stable child identity and reuse**

    - Children can now survive their parent's re-render. Give a single child a `key` in `registerChildren()`, or a catalog a `trackBy(item, index)`: while the key stays the same (and, for catalogs, the item is shallow-equal), the child keeps its instance and DOM — its factory isn't called and it isn't re-rendered. Its focus, caret, scroll position and unsaved input are kept. A changed or removed key still destroys and recreates it, and children without a key are recreated as before.
    - A kept child is moved into its new placeholder with `Element.moveBefore()`, so it never leaves the document: iframes don't reload, CSS animations keep running and custom elements don't get `disconnectedCallback`. Where `moveBefore()` isn't supported (Safari), it is re-inserted, and focus, caret and scroll are restored.
    - New `onReuse()` lifecycle hook, called on a kept child instead of a render.

- **Views can set their document title**

    - New `View.documentTitle()`: return a title (e.g. the article shown) and the router uses it for `document.title` after each navigation, before `config/seo.json`'s title, the `<viewName>.title` translation and `viewName`.

- **JS-only projects**

    - `nutin-new --js-only` generates a plain JavaScript project. TypeScript remains the default and recommended option.

### Changes

- **`nutin-update` merges files you edited.** A file you changed that also changed upstream used to be left at the old version, with a two-way diff in `NUTIN-UPDATE-REPORT.md`. The files around it were updated, so the project often didn't build until you merged by hand, and nothing said so. Now your file and the new version are merged three-way against the old one (`git merge-file`):
    - Edits that don't overlap are merged cleanly.
    - Overlapping ones get `diff3` conflict markers (yours / the original nutin version / the new one), and the update says the project won't build until they're resolved. This means `nutin-update` now writes to files you edited.
    - Files left with markers are recorded in `.nutin-meta.json` (`unmergedFiles`). Running `nutin-update` again refuses to update while any are left and lists them, instead of saying "Already up to date".
    - `NUTIN-UPDATE-REPORT.md` is now a short list of merged, conflicting and binary files, without diffs.
    - `nutin-update` needs git for this (the binary only, not a repository). Without it, it stops before changing anything.
    - Before writing anything, `nutin-update` checks that the project folder is committed: no changes and no untracked files (ignored files don't count), in a git repository. Otherwise it lists them and stops. So an update can always be undone with `git checkout -- . && git clean -fd`, which it prints when done. New `--allow-dirty` flag to skip the check.

- The [a11y-elements guide](https://nutin.org/guides/a11y-elements) now uses a11y-elements' `removeOverlaysWithin()`: components and views remove their overlays with it before re-rendering and when destroyed, and with `generateSEOFiles`, `main.ts` removes the pre-rendered overlays once the first view is mounted. An overlay moves itself to `<body>`, so these used to stay next to the new one (two overlays with the same `id`). From a CDN, overlays are loaded after the first view is mounted instead.

- New [Upgrading from 2.x to 3.0](https://nutin.org/docs/tools/upgrading-to-v3) guide: how to replace the generated files and migrate `src/app`, since `nutin-update` doesn't handle major versions. It also covers data a 2.x app saved with HTML-escaped `data-event` values (`a &amp; b`), which 3.0 displays as typed.

- `build:prod` runs `node tools/builder/builder.js --prod` instead of `NODE_ENV=production node …`, which Windows shells don't understand. `NODE_ENV=production` still works, so existing `package.json` scripts keep working.

- The dev server (`serve`, `dev`) listens on `127.0.0.1` only, the address it prints, instead of every network interface.

- `dev`, `serve`, `serve:prod` and `serve:only` accept a port: `npm run dev -- --port 3000`, `npm run serve -- --port=3000`, or `PORT=3000 npm run dev`. Precedence is `--port` > `PORT` > `9090` (default). Invalid ports fail fast with a clear error.

- **live-server is replaced by a built-in dev server** (`tools/dev/serve.js`, `node:http`, no dependency). live-server hasn't been released since 2019 and pulled in outdated dependencies. The new server logs its URL and fails with a `--port` hint when the port is busy (live-server silently moved to a random port). Prerendered SEO pages are served from their folder's `index.html`. Page navigations without a matching file get the SPA shell, even when the URL contains a dot (`/users/john.doe` used to 404); a missing asset gets a 404. `dev` reloads open pages after each successful rebuild (Server-Sent Events, via an external script so a CSP without `'unsafe-inline'` still allows it). `serve`/`serve:prod` no longer live-reload. Existing apps can remove `live-server` from their `devDependencies`.

- New apps get `esbuild` 0.28, `jsdom` 30 and `chokidar` 5 (they were on 0.25, 26 and 4). Existing apps keep their versions, and the updated tools work with both.

- **New TypeScript apps use TypeScript 7** (`^7.0.2`, the native compiler).

    - The build's route check (`validate-routes.js`) no longer imports `typescript`, since TypeScript 7 has no JavaScript API. It now uses esbuild for both TS and JS apps and reports the line of each duplicate route. A duplicate key anywhere in `routes.ts` is now reported, not only inside `appRoutes`. The CLI keeps its own pinned TypeScript 5.9.3 for `--js-only` generation; that version is separate from your app's.
    - The generated `tsconfig.json` no longer sets `baseUrl` (removed in TypeScript 7) or the empty `paths`.
    - The global `NavigationEventMap` declaration in `core/internals.d.ts` is renamed `RouterEventMap`. lib.dom now has its own `NavigationEventMap` (the Navigation API), and the two merged into conflicting `navigate` types.
    - To upgrade an existing app: run `nutin-update`, set `"typescript": "^7.0.2"` in `devDependencies`, and remove `baseUrl` and the empty `paths` from `tsconfig.json`. The updated tools also still work on TypeScript 5.

- The `dev` watcher now also rebuilds when files are added or deleted (e.g. by `npm run generate`), and when `config/`, `public/` or `nutin.config.js` change. It used to react to edits of existing `src/` files only.

- Opt-in dependencies (Tailwind, `markdown`) are installed by one shared helper, `tools/utils/ensure-deps.js`. Tailwind now behaves like `markdown`: outside an interactive terminal (CI, the dev watcher) it no longer installs packages on its own; pass `-- -y` to allow it. Its prod-build error shows the install command for your package manager instead of always `npm install`. The `-y` env variable is now `NUTIN_ASSUME_YES` (was `NUTIN_MARKDOWN_ASSUME_YES`). The Tailwind CLI is started through `node`, so it also works on Windows.

- Dynamic SEO routes are written to their real URL: `/blog/:slug` with `mockParams: { "slug": "hello-world" }` goes to `/blog/hello-world/` and is listed in `sitemap.xml` under that URL. Before, it went to a literal `:slug/` folder that no URL reached. New optional `outputPath` route field overrides that path.

- Prod builds compress files last, so prerendered SEO pages, `index.html`, `sitemap.xml` and `robots.txt` also get `.gz`/`.br` versions for nginx's `gzip_static`/`brotli_static`.

- testin-nutin mocks match the real services' public APIs. `MockEventBus` gets `subscribe`/`once`/`emit`/`off` with real dispatch (`subscribe`d callbacks used to never run, and `on()`, which `EventBus` doesn't have, is gone). `MockI18n` gets `setCurrentLanguage`, `onLanguageChange`, `getTranslationObject`, the `defaultLanguage`/`languages`/`localStorageKey` getters, and the real `translate(key, textContent)` lookup with nested keys and default-language fallback (the private-method mocks are gone). `MockRouter` gets `reload`, `getCurrentParams`, `getParam`, `removeEventListeners` and a `setParams()` helper. `MockHttpClient` gets `addRequestInterceptor`/`addResponseInterceptor`.

- `I18nService.onLanguageChange(callback)` now returns a function that unsubscribes the callback, like `Navigation.onNavigate()`. `MockI18n` does the same.

- New `testin-nutin:only` script runs the tests without rebuilding (it was already referenced in `AGENTS.md`).

- Two folders with the same name in different places (e.g. `admin/user/` and `public/user/`) used to overwrite each other's translations silently, since locales are keyed by folder name. That now fails the build and names both folders.

- `runCommand` no longer goes through a shell outside Windows, so arguments with spaces are passed unsplit.

- `dev` no longer leaves the server and watcher running (holding the port) when the terminal tab/window is closed or `dev-serve.js` is killed hard: it now handles `SIGHUP`, and both children exit when their IPC channel to it drops.

- Prod builds no longer hash or compress the copied `src/app` and `src/core` sources.

- `nutin-add` now also updates base files that depend on the added feature. The change is applied as a patch, so your own edits to those files are kept. When you edited right around it (e.g. added routes), each inserted block is placed next to the unchanged lines it belongs with instead. If those lines are gone too, the file is left untouched and the patch is printed to apply by hand.

- `nutin-add` features share a single `// Nutin features` block in `nutin.config.js`.

- New apps still get empty `src/app/components/` and `src/app/services/` folders, but no longer get a `.gitkeep` inside them.

- **Smaller prod bundle**: a new app's `bundle.js` goes from ~39 KB to 29.5 KB minified (9.6 KB gzipped, 8.6 KB brotlied).

    - Core services you don't use are left out of the bundle. `AppHttpClient` and the other singletons are now marked pure, so esbuild drops them when nothing imports them. An app that never imports `AppHttpClient` therefore no longer creates a default instance at load. Subclasses of `HttpClient` aren't affected.
    - With `i18n: false`, the i18n code (`I18nService`, `languages.json`, locale routing) is left out of the bundle unless app code references `I18nService`. New `initI18n()` (exported from `core/index`) loads the translations when `i18n` is enabled and does nothing otherwise. `main.ts` now calls `await initI18n()` instead of checking `nutinConfig.i18n` itself. `I18nService.initTranslations()` is unchanged.
    - With i18n disabled, a per-language `title` in `config/seo.json` resolves to its first value. It used to depend on the browser's language.
    - The browser bundle no longer includes the tooling-only parts of `nutin.config.js` (`builder`, `testinNutin`, `dockerPorts`, `markdownSources`; the markdown feature's code gets its folder list at build time instead, so an app that doesn't use it ships none of it) or the `config/seo.json` fields it doesn't read: it keeps each route's `path` and `title`, and drops `baseUrl`, descriptions, `ogImage` and `disallowBots`. Any other config key stays readable from app code.

### Fixes

- SEO page generation no longer expands `$&`, `` $` ``, `$'` in `config/seo.json` titles/descriptions (they copied raw page HTML into `<title>`/meta tags). The page URL and `hreflang` links are now HTML-escaped too.

- i18n lookups only follow a translation file's own keys: `translate('constructor')` returned `Object`'s source text.

- The `docker` feature's nginx config sends `X-XSS-Protection: 0` (the old `1; mode=block` is deprecated and can itself be abused in older browsers).

- A parent's render no longer applies `data-pipe` a second time to content inside its child components (e.g. a pipe appending `!` rendered `hi!!`).

- When a route guard redirects during back/forward navigation, a `reload()` or the first page load, the address bar now shows the redirect target. The guarded URL is replaced in history instead of being left in place, so Back no longer lands on it again. Redirects from in-app navigation still add a new history entry.

- New apps no longer ship with a CSS reset.

- `docker:build` now works with the `markdown` feature: the Dockerfile copies every `markdownSources` folder into the image build (folder names with spaces included). A folder outside the project is rejected with a clear error.

- Broken internal Markdown links are all reported at once per page, without marked's misleading "Please report this to marked" suffix.

- testin-nutin's TODO lines now show the real `.test.js` path in TypeScript projects instead of `.test.ts`.

- `testin-nutin:watch` works: it ran a nonexistent `testin-nutin/runner.js`. It also rebuilds before each run (tests import `dist/`), watches `src/` (plus `tools/` with `includeTools`), and reacts to added and deleted files. A change made while tests are running now triggers another run instead of being dropped.

- A test file that fails to import (syntax error, bad import) now fails the run with exit code 1. It used to be printed and skipped, so CI passed.

- A build killed by Ctrl-C, `kill` or a crash no longer leaves `.build-lock` behind. The next build used to wait 2 minutes and then fail. The lock is released on `SIGINT`/`SIGTERM`/`SIGHUP`, and a lock whose process is gone is freed right away.

- `$$`, `$&`, `` $` `` and `$'` in component/view templates are kept literally when merged. `Cost: $$5` used to become `Cost: $5`, and `$&` pasted the placeholder back in. The same applies to prerendered SEO pages (`$&` in rendered content duplicated the `#app` element).

- `robots.txt`: a bot listed in `disallowBots` stays fully blocked even when a route also names it in `disallow`. A bot with its own group now repeats the global `disallow: true` paths, since robots.txt groups don't inherit `*`. With i18n, disallowed paths cover each `/<lang>/` prefix, and dynamic segments become `*`.

- `sitemap.xml` leaves out routes disallowed for every bot, and its URLs are XML-escaped.

- SEO prerendering runs each route's guards first, as an anonymous visitor. A route a guard blocks or redirects (e.g. a logged-out `/admin` sent to `/`) is no longer written as public static HTML. It's also left out of `sitemap.xml`, with a build warning naming it. Guards that allow the route still run, so loader guards (the `markdown` feature's) have their data when the page renders. During SSR, `fetch()` can also read files the build already wrote (e.g. `/generated/<name>.json`); paths outside the build folder are refused.

- SEO prerendering fills any element with `id="app"`, not only `<main id="app">`, and keeps its attributes (other elements used to get empty pages). It fails the build when index.html has no closed `#app` element.

- SSR's route check passes the locales folder, so a locale fetch during module load no longer throws an unhandled rejection.

- Sass partials (`_name.scss`) under `src/app` are no longer compiled on their own, which duplicated their CSS in `main.css`.

- `toBeLessThan`/`toBeGreaterThan` no longer pass when both values are equal.

- In testin-nutin, a `beforeEach`/`afterEach`/`beforeAll`/`afterAll` declared after some `it()` calls now applies to them too.

- A coverage run that covers no file now reports 0% instead of 100%, so it fails a threshold instead of passing it.

- The SSR "unguarded browser global" hint points to the real `tools/builder/core/seo/ssr/ssr-polyfills.js` path.

- `html`: a plain value interpolated in tag position (`<button ${attrs}>`) is filtered like `raw()` there. Escaping left `name=value` intact, so data such as `data-event=click:_remove` added a binding that called the component's method. Plain attributes (`${disabled ? 'disabled' : ''}`) still work.

- A component no longer binds, fills or reads the `data-event`, `data-bind` and `data-i18n` elements of nested child components. A child `data-event="click:toggle"` used to fire the parent's `toggle()` too, the parent's `props` overwrote the child's `data-bind` fields, and `getValues()` returned them.

- `data-optional` cleanup only looks inside the rendering component. It used to scan the whole document on every render, and it missed components rendered while detached.

- `props.className` accepts several space-separated classes; it threw `InvalidCharacterError`.

- The `date` pipe's time flag reads `"true"`/`"false"` from templates: `date:en-US,long,false` showed the time.

- Router:
    - A navigation whose guards resolve after a newer navigation has started is dropped; it used to render over the newer one.
    - The query string is kept by `navigate()`, `reload()`, back/forward and language switches.
    - Route params are URL-decoded (`/users/J%C3%B6rg` → `Jörg`).
    - Static route segments match literally (`.` in a pattern matched any character).

- `EventBus.emit()`: a listener that throws is reported with `console.error` and no longer keeps the other listeners from running.

- i18n no longer crashes the app at load when the browser blocks site storage (`localStorage` throws a `SecurityError`). Teardown keeps the saved language preference; `resetTranslations()` still forgets it.

- `trustedAPIs` match on whole path segments: a trusted `https://api.example.com/v1` no longer trusts `/v10`.

- Catalog items no longer get the `normalizeKeys` array spread into their props as `0`, `1`, … keys.

- Template minification no longer breaks a template that contains a nested `html```, such as `${items.map((i) => html`<li>${i}</li>`)}`. An inline template was cut at the inner backtick, and the minifier closed the "unclosed" markup, turning the code into a syntax error. The build now finds the real end of each template. Each `${…}` is swapped for a placeholder while the markup is minified, then put back exactly as written, so the minifier never sees JavaScript (it used to collapse spaces inside `${'a   b'}` in external templates too). Nested `html``` templates are minified the same way. A template that can't be minified safely, such as one with `style="${…}"` or a dynamic tag name, is kept as written, with a note in the build output.

- `nutin-add` builds the feature template path from the generator's templates root instead of recomputing it. The CLI also drops several unused leftovers.

- `nutin new` no longer fails when git isn't installed or `git init` fails. It warns and creates the project without a repository.

- `nutin-update` and `nutin-add` in a project without `.nutin-meta.json` no longer crash (stdin closed, e.g. CI) or wait forever (stdin an open pipe) when the shell is non-interactive. They exit with a message that says to run the command in a terminal or create `.nutin-meta.json` by hand, with an example. Nothing is written.

- When `nutin-update` or `nutin-add` rebuilds a missing `.nutin-meta.json`, it now detects JavaScript projects (`src/app/main.js` and no `main.ts`) instead of always recording `"lang": "ts"`. With `"ts"`, a `--js-only` project was compared against the TypeScript templates, so files you never touched (e.g. `AGENTS.md`) were reported as modified by you. The detected language and package manager are printed.

## 2.1.1

### Changes

- `src/app` no longer has an imposed structure. 

The generator now creates elements in `src/app/<path>/` instead of `src/app/<type>s/<path>/` (e.g. `generate view user/user-view` → `src/app/user/user-view/`). 

New projects still ship `components/`, `services/` (empty) and `views/` as the suggested layout, so pass the folder explicitly to keep it (`generate component components/my-component`).

- Removed the `src/app/{components,views,services}/index.ts` barrel files from new projects, and the generator no longer appends exports to them. 

Import app elements by their file path.

Import Nutin elements by the framework's barrel (`src/core/index.ts`).

- Sass now compiles every `.scss` file under `src/app` instead of only `src/app/components` and `src/app/views`.

- The generator now exits before writing anything if the target folder already exists and isn't empty, since folder names carry no type suffix.

- Dev builds (`dev`/`serve`/`build`) now bundle with esbuild too, unminified with a sourcemap and `console`/`debugger` kept, so npm runtime dependencies work in dev without import maps or vendoring. tsc's per-file output is still emitted for testin-nutin.

- Sass now resolves `@use "pkg:<package>/<path>"` imports through `node_modules`.

- The default `builder.esbuild.target` in `nutin.config.js` is now `es2020` (was `es2015`), which libraries relying on native `async` functions (e.g. Alpine) require. Existing projects keep their own `nutin.config.js` value.

- Generated SEO HTML now includes `hreflang` alternates (one per language plus `x-default`) when i18n is enabled, `og:type` and `twitter:card` (`summary_large_image`) meta tags, and an absolute `og:image`/`twitter:image` URL (a relative `ogImage` in `config/seo.json` is now prefixed with `baseUrl`).

- The router now supports `#hash` fragments: navigating to `path#id` keeps the hash in the URL and scrolls to the matching element, falling back to the top of the page. The hash is also kept on reload and on language change.

- New `NavigationManager.replaceState(path)` (exported from `core/index.ts`) rewrites the current URL without adding a history entry. The router now updates history before rendering the new view, so a view's `onEnter()` can call it without the change being overwritten.

- Docker feature: `tools/docker/Dockerfile.template` now defaults to Node `24.21.0` (was `22.23.2`) Alpine `3.24` (was `3.20`, end-of-life) for the nginx runtime image (nginx `1.26` → `1.30`).

- Docker feature: in i18n projects, nginx now redirects a bare `/` to the default language (generated into `nginx.conf` through a new `__ROOT_REDIRECT_PLACEHOLDER__` token).

### Fixes

- `generate` with a missing argument now prints its usage message instead of crashing.

- Attributes set on a `data-component` placeholder (`class`, `id`, `aria-*`, `data-*`, …) are now kept on the mounted component's element instead of being dropped. Classes are merged with the component's own.

- Builds now take a lock (`.build-lock/`, gitignored) before touching `dist-build`, so concurrent builds (a manual build during `dev`, or stray watcher processes) no longer corrupt each other's output.

- The dev watcher no longer drops a file change made while a rebuild is running. It now rebuilds again once the current build finishes.

- Stopping `dev` now kills the whole process group of live-server and the watcher (including an in-flight build), so no orphaned watcher processes are left behind. On Windows, the process tree is killed with `taskkill` instead.

- SSR now renders views into a real `<main id="app">`, so unset `data-optional` fields are removed from prerendered HTML instead of leaking the literal text `undefined`.

- Ctrl/Cmd/Shift/Alt-clicks and middle-clicks on `<a href>` elements with a `data-event` click handler now fall through to the browser's native behaviour (e.g. open in a new tab), instead of being intercepted.

- Docker feature: nginx now issues relative redirects (`absolute_redirect off`), so the trailing-slash redirect on prerendered routes no longer leaks the container's internal port or scheme behind a proxy. A route directory without its own `index.html` now serves the SPA shell instead of a 403.

## 2.1.0

### Breaking Changes

- `View`'s `viewName` is now a required constructor option. Every `View` subclass must now pass `viewName` explicitly.
- Removed the `generator` object from `nutin.config.js`. The generator now always scaffolds a stylesheet, and gates locale/test file generation on the existing `i18n` and `testinNutin.includeApp` flags.

### Fixes

- Restored `document.title` updates on route change, regressed silently in 2.0.0's rewrite, default to the view's `viewName`.
- Fixed leaked-listener/subscription bug that affected every re-rendering component. Previously-mounted child components (single or catalog) are now properly destroyed before a re-render mounts their replacements.
- `HttpClient`'s constructor `defaultHeaders` are now actually merged into outgoing requests (previously silently dropped — only per-call `config.headers` were sent).
- `data-optional` elements with literal `"null"` text content (e.g. `<span data-optional>null</span>`) are now correctly removed, matching the existing `"undefined"` handling.
- `revealGlobals` now restores the element's original `display` value by default (captured automatically by `hideGlobals`), instead of always forcing `block`; an optional second argument still allows an explicit override.
- A `data-pipe` chain segment with an empty name (e.g. `data-pipe=":arg"`) now logs a warning and is skipped, instead of silently aborting the entire chain with no write-back.
- Removed a redundant duplicate translation-file fetch on startup when i18n is enabled.

## 2.0.0

Version 2.0.0 focuses on simplicity and clear APIs over feature accumulation: fewer abstractions, clearer responsibilities, and a more focused API. 

### Breaking Changes

- Renamed `BaseComponent`'s `childConfigs()` to `registerChildren()` and `catalogConfig` to `createCatalogComponents()`.
- Raised the required Node.js version from `>=18` to `>=22`.
- Removed all libraries except `Pipes`, as they did not fit Nutin's philosophy.
- Removed `Store`. Its responsibilities were unclear and largely duplicated what services already provide.
- Removed the `force` parameter from `listenToRenderEvents()`. It is no longer needed.

### Architecture & API

- Clarified and separated the responsibilities of the base classes:
  - **`BaseComponent`**: render lifecycle, hydration, DOM lifecycle, DOM and EventBus subscriptions, teardown, render guard, and composition orchestration.
  - **`Component`**: props (`className`, `style`, `data-bindings`), configuration/defaults/normalization, and template generation through `templateFn`.
  - **`View`**: route parameters, navigation hooks (`onEnter()` / `onExit()`), and view identity (`viewName`).

- Components and Views now inherit `listen()` and `listenToRenderEvents()` methods with automatic unsubscription.
- Added explicit lifecycle hooks:
  - **Component:** `onBeforeRender()`, `onAfterRender()`, `onBeforeDestroy()`, `onAfterDestroy()`
  - **View:** `onEnter()`, `onExit()`

- Simplified the EventBus API:
    - Added `AppEventMap` for app-level events. Nutin's internal events are no longer declared in `globals.d.ts`.
    - Event payload types are now objects.
    - EventBus now exposes domain facades for `Navigation` and `Lifecycle` events.
    - Event subscription functions (`on*`) now return a closure for unsubscription.
    - `AppEventBus` can still be used directly when needed (`once()`, etc.), but subscriptions must then be unsubscribed manually through the `onBeforeDestroy()` hook.
```ts
// emit
Navigation.navigateTo('path');
// closure
const unsub = Navigation.onNavigate(this.doStuff);
// onDestroy
unsub()
```

### Services

- Services now expose a single `getInstance()` method.
- Arguments can be passed to `getInstance()`, but are only used during the first instantiation.

### Configuration & Build

- Added `nutin.config.js` as the central configuration file for Nutin options, builder, generator, and testing.
- Added optional Tailwind CSS v4 support as a utility layer alongside SASS.
- Added globally scoped stylesheets co-located with feature files. **Use unique class names.** Nutin's naming convention encourages prefixes such as `home__header`.
- HTML templates can now be either inline or external `.html` files. Defining both, or neither, fails the build.
- Added configurable Docker ports through `nutin.config.js`.
- Dockerfile now builds a Brotli-enabled image.

### SEO & i18n

- Added optional generation of static SEO files from `config/seo.json`.
  - Production builds generate static HTML for each route using the actual components.
  - Only `title`, `description`, and `ogImage` remain hand-authored SEO content.
  - Generates `robots.txt` and `sitemap.xml`.
  - Supports per-route `disallow` and `disallowBots`.

- i18n now uses the URL, aligning with common practices and allowing static SEO HTML to be generated for each language.

### CLI & Developer Experience

- Added `nutin-update`, which updates Nutin to the latest patch or minor version by diffing the project against the new templates and merging compatible changes. Unresolved conflicts are reported.
- Added `nutin-add docker`.
- Added `GETTING_STARTED.md`, providing the architectural context and conventions needed to start working with a Nutin project without immediately consulting the full documentation.
- Added `AGENTS.md`, providing LLMs with the minimal context required to work effectively in a Nutin project.

### TestinNutin

- Added code coverage summaries for branches, functions, and lines.
- Added `it.todo`.
- Added clock mocking for `setTimeout` and `setInterval`.

### Bug Fixes

- Numerous bug fixes and stability improvements.

## 1.3.1

- Minor features:
    - New BaseComponent protected method.
    Register events that will trigger re-render. Call this in component's constructor.
    ```ts
    // force = true: calls forceRender() instead of render()
    listenToRenderEvents(events: EventKey[], force: boolean = false): void
    ```
    - data-optional now supports JS values
    ```html
    data-optional="${myValue}"
    ```
    - PopoverView and AnchorComponents now have accessibility features
    - ButtonManager now handles checkboxes as well
    - i18nService now emits `language-changed` event and exposes related methods

- Fixes:
    - CatalogConfig no longer renders multiple containers when render() or forceRender() are triggered by events
    - Event Listeners are now destroyed properly before triggering a re-render
    - Router now correctly redirects to 404 page when URL starts with two slashes `//`.
    - Popover no longer flickers on close
    - Snackbar messages are now properly sanitized

- CLI
    - Rework: App creation flow
        - No features enabled by default
        - Presets `--preset <minimal|standard|full|cicd>`
            Minimal: External templates
            Standard: Minimal + i18n & built-in SCSS utilities.
            Full: Standard + deployment helpers & built-in testing toolkit
            CI/CD: Minimal + deployment helpers
        - Remaining flags: `--i18n`, `--deploy-helper`, `--testin-nutin`, `--transition`

## 1.3.0

Version 1.3.0 marks a stability milestone with various improvements and refinements, making this the recommended version for new projects.

- Global
    - `Service` abstract class now auto-binds methods with `this`, preventing `"this" is undefined` potential warning on initial page load.
    - Added HTML template sanitization with trustLevel that can be passed to component's `super()`.
        - trusted : no template sanitization (returns original)
        - normal (default) : remove scripts and inline event handlers
        - strict : remove iframe, object, embed, href (javascript), data: protocol, scripts and inline event handlers

- I18n
    - Removed `data-i18n-params` pipe : Default values (fallback) must now be inlined text content in component's HTML template. 

- CLI :
    - Deployment helpers is now optional (default : disabled). Flags : `--deploy-helper`  `--no-deploy-helper`
    - Fixed CLI prompts (no longer overrides answers)

- Builder / Deployment Helper
    - Now adds stylesheet & script tags in `index.html` on build time (`add-tags.js`)
    - (Production) Added file hashing (js & css) (`hash-files.js`)
    - (Production) Added Gzip and Brotli compression (`compress-files.js`). Configurable in `builder.config.js`
        - **Note : default nginx alpine image does NOT support Brotli compression.** If you want to use it :
            - uncomment brotli-related sections (`BROTLI OPTIONAL`) in `builder.config.js` and `tools/builder/core/compress-files.js`
            - enable brotli in nginx.conf
            - You'll also need to use an existing Brotli-enabled nginx image or build your own from source.
    - Enabled gzip globally in `nginx.conf` and removed `gzip.conf` (compress during build).

- StylinNutin
    - Added utility classes `u-text-center`, `u-text-right`, `u-text-left`, `u-font-primary`
    - box-shadow variables now use `$primary-color`

- TestinNutin
    - Now applies `setupJsdom()` beforeAll (was beforeEach) and `teardownJsdom()` afterAll (was afterEach) in `test-queue.js` (improved efficiency / speed)

## 1.2.3

- `nginx.conf` : fixed multi-line CSP map warning (single line map)

## 1.2.2

- Fixed Nginx security headers in child location blocks.

- Fixed package manager variable in `dev-serve.js.hbs` runCommand

- Removed ghost files

## 1.2.1

- Builder

    - Added config file `builder.config.js` file (esbuild, verbose)

- I18N

    - Added JSON config file for centralized languages (`config/languages.json`)

- testin-nutin

    - Added config file `test.config.js` (origins array, verbose boolean)
    - Added assertions + automated 'not' counterparts
    - Improved spyOn
    - Improved JSDOM setup & global registration

- Improved deployment tools Dockerfile (nginx conf + gzip)

    - Fixed typo and added comments in `nginx.conf`.
    - Extracted gzip config from Dockerfile (removed `sed` command)
    - Moved Dockerfile and deployment config files (`nginx.conf`, `gzip.conf`) into their own folder `tools/deployment`.
    - Added `docker:build` and `docker:run` scripts in package.json.

- Moved dev tools (`serve.js`, `dev-serve.js`, `watcher.js`) into their own `tools/dev` folder.

- Added explicit chokidar devDependency (sass & live-server transitive).

## 1.2.0

- Fixed `npm run dev` command. Added middleware to reload nested routes.

- Improved `data-optional` tag:
    - Can now specify which attribute to check with `data-optional="attrName"` (`src`, `href`, ...)                           
    - Now works for `img`, `input`, etc

- Event Bus : 
    - Tracks both event name + callback.                           
    - cleanupEventListeners now works correctly.                           
    - New property: `once`. `once` subscriptions automatically remove themselves after first call.

- HTTP client : 
    - Optional request / response interceptors.                           
    - Full timeout / abort controller support preserved.                           
    - onDestroy now clears interceptors to prevent memory leaks.

- Improved builder

    - Implemented `esbuild` & `html-minifier-terser`.                                 
    - Added flags `--bundle` (for production-ready build. *`npm run build --bundle` is equivalent to `npm run build:prod`)* and `--log` (verbose output). **Doesn't work with yarn or bun**.                                
    - Commands: `npm run build`, `npm run build:prod`,  `npm run serve:only`, `npm run serve`, `npm run dev`.                            

  *Note: `--prod` or `--production` will set NODE_ENV to production, and have the same effect as `--bundle`.* `const isProd = process.env.npm_config_bundle || process.env.NODE_ENV === 'production';`

- Improved deployment tools Dockerfile (nginx conf + gzip)

- stylin-nutin (generator)
    - When generating a component, prompts (boolean) to generate a `_component-name.scss` file in `styles/components` (forwarded by `styles/components/_index.scss`).

## 1.1.0

- Added index access in CatalogConfig. Use with `config.index`.
```typescript
interface CatalogItemBase {
  index: number;
}
type CatalogItemObject<T extends object> = T & CatalogItemBase;
interface CatalogItemPrimitive extends CatalogItemBase {
  value: string | number | boolean | null | undefined;
}

// type safety
type CatalogItemConfig<T = any> =
  T extends object ? CatalogItemObject<T> : CatalogItemPrimitive;
```

**Notes:** *Primitive data arrays (string, number, etc) needs to be accessed with `config.value`.*

## 1.0.2

- Partially fixed `npm run dev` script when using internal templates. *Page still needs to be reload manually from time to time.*

## 1.0.1

- Fixed typo issue when using i18n feature
