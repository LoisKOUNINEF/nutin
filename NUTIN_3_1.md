# Nutin 3.1

_Plans for Nutin 3.1: the Chrome extension option first (§1–9), then Nutin findings from other apps (§10)._

 Nutin's render() lets the exception through,

 
_Written 2026-10-19 from `notes-extension` (Ticknote), a Nutin 3.0.0 app generated on 2026-10-18
(initial commit `d2291d0`) and turned into a Manifest V3 Chrome side-panel extension. Every fact
below comes from `git diff d2291d0 HEAD` or from a build/check run on that repo on 2026-10-19._

## Context

Ticknote is a Chrome extension built on a generated Nutin app: notes and to-dos per page and per
site, shown in Chrome's side panel. The goal of this document is to record **every change made to
the generated app to make it an extension**, so it can later become an opt-in Nutin option
(`nutin add extension`, following the `docker`/`markdown` feature pattern), and to list the
**manual steps** a developer still has to do.

**The approach that worked:** the extension layer sits *next to* the Nutin build, not inside it.

- `src/core/` and `tools/builder/` are **untouched** (`git diff d2291d0 HEAD -- src/core tools/builder`
  is empty).
- The normal Nutin build (`builder.js`) produces `dist/src` as usual. A small post-build script,
  `tools/extension/package-extension.js`, then turns `dist/src` into an unpacked extension (and
  optionally a store zip).
- The extension-only sources live in a new `src/extension/` folder: the manifest and the service
  worker.
- The UI is a normal Nutin app mounted **without the router**: one root component in `main.ts`.

`dist/src` is the extension root: Chrome loads it as-is, and its contents are the store zip.

---

## 1. Changes, file by file

Legend: **[generic]** = needed by any Nutin extension, belongs in the option.
**[app]** = Ticknote-specific, listed only so it isn't mistaken for a requirement.

### 1.1 `src/extension/manifest.json` (new) [generic, values app-specific]

```json
{
  "manifest_version": 3,
  "name": "Ticknote",
  "description": "Ticknote: notes and to-dos for each page and each site, in Chrome's side panel.",
  "version": "0.0.0",
  "minimum_chrome_version": "116",
  "icons": { "16": "assets/icons/ticknote-16.png", "32": "…", "48": "…", "128": "assets/icons/ticknote-128.png" },
  "action": {
    "default_title": "Ticknote",
    "default_icon": { "16": "assets/icons/ticknote-16.png", "32": "assets/icons/ticknote-32.png" }
  },
  "side_panel": { "default_path": "index.html" },
  "background": { "service_worker": "background.js", "type": "module" },
  "permissions": ["sidePanel", "storage", "tabs"],
  "commands": {
    "_execute_action": { "suggested_key": { "default": "Alt+Shift+N" }, "description": "Open Ticknote" }
  }
}
```

Key by key:

- `version` is a placeholder. The packaging script **overwrites it with `package.json`'s
  `version`**, so a release only bumps `package.json`.
- `side_panel.default_path: "index.html"` is the Nutin page (`dist/src/index.html`). For a popup
  extension it would be `action.default_popup: "index.html"` instead (verified earlier as a popup:
  see NUTIN_KNOWLEDGE, "Router-less apps").
- `background.service_worker: "background.js"` + `"type": "module"`. `background.js` doesn't exist
  in the sources: the packaging script bundles it from `src/extension/background.ts`.
- `minimum_chrome_version: "116"`: `chrome.sidePanel` exists since 114, and
  `sidePanel.setPanelBehavior` (used by the worker) since 116. The CSS also relies on 116:
  `:has()`, and `justify-content: safe center` (115+).
- Icon paths point into `assets/`, because files must be **under `src/`** to be copied (see §3.2).
- `commands._execute_action` gives the toolbar action a keyboard shortcut. With `setPanelBehavior`
  that shortcut opens the panel.
- Permissions [app]:
  - `sidePanel` for the UI
  - `storage` for `chrome.storage.local` / `.sync`
  - `tabs` to read the active tab's URL on every tab switch. `activeTab` isn't enough for a panel
    that stays open across tabs; the store justification is in `docs/store-listing.md`.

### 1.2 `src/extension/background.ts` (new) [generic for side panels]

```ts
// Extension service worker: the toolbar action (and its Alt+Shift+N shortcut) toggles the side panel.
chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error: unknown) => console.error('Could not set the side panel behavior:', error));
```

- It's a separate esbuild entry, because the Nutin builder only bundles `src/app/main.ts`.
- It's type-checked by the normal build, since `tsconfig.json` includes `src/extension` (§1.5).
- Its `console.error` survives prod builds. `nutin.config.js`'s `esbuild.drop: ['console', 'debugger']`
  applies to the app bundle only; the worker has its own esbuild call.

### 1.3 `tools/extension/package-extension.js` (new) [generic]

This runs after `builder.js`. It uses only `fs`, `path`, `child_process`, `esbuild` (already a
devDependency) and `tools/utils` (`print`, `errorExit`, `getFilesRecursive`, which is the sync
version in `tools/utils`). Flags are `--prod` and `--zip`.

Steps, in order:

1. **Guard:** fail if `dist/src/index.html` is missing ("Run the Nutin build first.").
2. **Bundle the worker:** `esbuild.build({ entryPoints: [src/extension/background.ts],
   outfile: dist/src/background.js, bundle: true, format: 'esm', platform: 'browser',
   target: ['chrome116'], minify: isProd, sourcemap: !isProd, legalComments: 'none' })`.
3. **Write the manifest:** read `src/extension/manifest.json`, set `version` from
   `package.json`, and write `dist/src/manifest.json` (pretty-printed).
4. **Copy font licenses [app, but the need is generic]:** the builder only copies binary files,
   `.html` and `.ts` from `src/` (and `.json` in prod), so `src/assets/fonts/**/LICENSE.txt`
   wouldn't ship. The script copies every `.txt` under `src/assets/fonts` into
   `dist/src/assets/fonts`. A generic version should copy any non-built file the extension needs
   (§3.2).
5. **Remove `dist/src/extension/`:** the builder copies `src/extension` like any other source
   folder, and in dev also emits tsc output there. None of it is needed: the manifest is written
   in step 3 and the worker bundled in step 2.
6. **Prod only: remove `*.gz` and `*.br`.** The prod build pre-compresses files for a web server.
   Chrome reads the plain files, so the compressed copies only bloat the package.
7. **`--zip`:** `zip -r -X -q dist/ticknote-<version>.zip . -x '*.map' '.DS_Store'`, run inside
   `dist/src`, so the files sit at the zip's root as the Web Store requires. It needs the `zip`
   command; if it's missing, the error says so.

The name `ticknote-` is hardcoded and should come from the manifest or `package.json` in the option.

### 1.4 `package.json` [generic, except the dependency]

```diff
-  "name": "notes-extension",
+  "name": "ticknote",
   "scripts": {
+    "build:extension": "npm run build:prod -- -y && node tools/extension/package-extension.js --prod",
+    "build:extension:dev": "npm run build -- -y && node tools/extension/package-extension.js",
+    "package:extension": "npm run build:prod -- -y && node tools/extension/package-extension.js --prod --zip",
   },
   "devDependencies": {
+    "@types/chrome": "0.3.5",
   },
+  "dependencies": {
+    "a11y-elements": "^0.4.0"        // [app] UI components, not needed by an extension
+  }
```

- `-- -y` (`NUTIN_ASSUME_YES`) keeps the build from stopping to prompt for opt-in dependencies
  when the scripts run outside an interactive terminal (CI, editors).
- The `version` field is the extension's version (§1.3 step 3).

### 1.5 `tsconfig.json` [generic]

```diff
     "resolveJsonModule": true,
+    "types": ["chrome"],
     "typeRoots": ["src/types", "node_modules/@types"]
   },
-  "include": ["src/app", "src/core"]
+  "include": ["src/app", "src/core", "src/extension"]
```

- `types: ["chrome"]` makes the `chrome.*` globals available everywhere.
  - **Side effect:** with `types` set, TypeScript no longer includes every `@types/*` package
    automatically, only the listed ones. The generated app has no other `@types` and no
    `src/types` folder, so nothing changed here. The option should *append* to `types`, not
    replace it.
- `src/extension` in `include` gets the worker type-checked by the normal build (prod runs
  `tsc --noEmit`).

### 1.6 `src/app/main.ts`, and the deleted routing files [generic pattern]

Generated:

```ts
import { AppRouter, initI18n, registerPipes } from '../core/index.js';
import { appRoutes } from './routes.js';
class App { constructor() { registerPipes(); AppRouter(appRoutes); } }
document.addEventListener('DOMContentLoaded', async () => { await initI18n(); new App(); });
```

Now (abridged, [app] parts noted):

```ts
import { initI18n, registerPipes } from '../core/index.js';
import { SidebarComponent } from './components/sidebar/sidebar.component.js';
// … app services

// The side panel page: no router (the panel only ever shows index.html), one root component.
class App {
  constructor() {
    registerPipes();
    registerAppPipes();                          // [app]
    new SidebarComponent('#app').render();       // the root component, mounted into <main id="app">
  }
}

// Each step that can fail (the extension reloaded under an open panel...) is reported, and the
// panel still mounts: a blank panel would say nothing.
async function start(step: string, run: () => unknown) { try { await run(); } catch (e) { /* toast */ } }

document.addEventListener('DOMContentLoaded', async () => {
  await start('load the translations', () => initI18n());
  await start('load your settings', () => settingsService.init());   // [app] chrome.storage
  scopeStoreService.init();                                           // [app]
  await start('read the current tab', () => activeTabService.init()); // [app] chrome.tabs
  clockService.start();                                               // [app]
  new App();
});
```

**Deleted:** `src/app/routes.ts`, `src/app/guards.ts`, `src/app/views/home/*`,
`src/app/views/not-found/*`, `src/assets/images/logo-*.avif`.

Why there's no router:
- Extension pages load as `chrome-extension://<id>/index.html`. With `AppRouter`, the pathname
  `/index.html` matches no route and **the 404 view shows** (verified earlier as a popup; see
  NUTIN_KNOWLEDGE).
- A side panel or popup only ever shows one page anyway.
- Without the router, the builder **skips the route and `#app` validation**:
  `validate-routes.js` only runs when app code imports `routes.ts` or `generateSEOFiles` is on.
  So deleting `routes.ts` is safe.

A routed extension (e.g. an options page with several screens) would need hash routing, or the
router told to treat `/index.html` as `/`. Nutin has neither today (§4).

**Startup failures matter more in an extension:** when the extension is reloaded under an open
panel, `chrome.*` calls throw ("Extension context invalidated"). Each init step is wrapped and
reported, so the page still mounts.

### 1.7 `src/index.html` [generic]

```diff
     <meta name="viewport" content="width=device-width, initial-scale=1.0" />
+    <title>Ticknote</title>
     <link rel="icon" type="image/x-icon" href="/favicon.ico" />
```

- There's a static `<title>` because, without the router, nothing sets `document.title`
  (`View.documentTitle()` is router-driven). Chrome shows it in the side panel's header and menu.
- `<main id="app"></main>` is kept. The root component mounts there, and testin-nutin's framework
  tests mount into `#app` too (AGENTS.md).
- The built page has **no inline script**: the builder injects
  `<link rel="stylesheet" href="/main.<hash>.css">` and
  `<script type="module" src="/bundle.<hash>.js">`. That's compatible with MV3's default CSP
  (`script-src 'self'`).

### 1.8 `nutin.config.js` [app choice, with generic implications]

```diff
-    includeFramework: true,  // Test Nutin source - src/core
+    includeFramework: false,
-    includeApp: false,       // Include application tests
+    includeApp: true,
```

- Test scope: app tests on, framework tests off. This is a project choice, not an extension need.
- **Unchanged but relevant:**
  - `i18n: false`. Nutin's i18n prefixes URLs (`/<lang>/…`), which an extension page can't have.
    Translations without URL prefixes would be needed (§4).
  - `generateSEOFiles: false`. Prerendered HTML, `robots.txt` and `sitemap.xml` mean nothing in
    an extension. `config/seo.json`'s title and description were edited, but that's cosmetic and
    unused.
  - `builder.esbuild.drop: ['console', 'debugger']` (prod) applies to the app bundle only (§1.2).

### 1.9 Assets and styles [mostly app, with two generic findings]

- **Icons:** `src/assets/icons/ticknote-{16,32,48,128}.png`. They can't live in `public/`: the
  builder's `copy-static.js` copies only `public/favicon.ico` from there (§3.2). The panel's
  favicon stays `public/favicon.ico`.
- **Absolute URLs work:** `/favicon.ico`, `/main.<hash>.css` and `url('/assets/fonts/…')` in CSS
  resolve against `chrome-extension://<id>/`, so the builder's absolute paths need no rewriting.
- [app] Fonts are bundled locally in `src/assets/fonts/` (`.woff2`). An extension can't load
  remote fonts without loosening its CSP, and the Web Store frowns on remote resources.
- [app] Theme tokens, `a11y-elements` (`@use "pkg:a11y-elements/a11y.css"` in `main.scss`) and the
  `_reorder.scss` partial are app design only.

### 1.10 App-level patterns worth templating [generic patterns, app code]

These live in `src/app` but solve problems every extension built on Nutin will have:

- **`services/chrome-api/chrome-api.service.ts`, the only place that touches `chrome.*`:** a
  Nutin `Service` with a small typed surface:
  - `storageGet/Set/Remove(area, …)` and `onStorageChanged(cb) → unsubscribe`
  - `getActiveTabUrl()` and `onTabsChanged(cb) → unsubscribe`
  - `openTab(url)` and `openInActiveTab(url)`
  - `syncQuota()`, with documented fallbacks when the constants are missing

  It reads `chrome` *on every call* (never caches it at import), so tests can install a fake global
  before each test. It's also the single file a Firefox port would change.
- **`testing/fake-chrome.js`:** an in-memory `chrome` for testin-nutin (jsdom has none):
  - events with `addListener`, `removeListener`, `hasListeners` and `dispatch`
  - storage areas that clone values in and out (like real JSON serialization), with
    `failNextSet` to simulate quota errors, quota constants, and `onChanged` dispatch
  - `tabs.query`, `tabs.create` and `tabs.update` (recorded)
  - helpers `activateTab(url)` and `navigate(url)` that fire the real events

  It's installed and removed with `installFakeChrome()` / `uninstallFakeChrome()`.
- **`testing/panel.js`:** `startPanel({ url, settings })` installs the fake, registers pipes, seeds
  settings and inits services the way `main.ts` does. It captures toasts and returns
  `stop()` to tear everything down. It also exports `settle()`, which flushes promises twice so
  chained storage→event→render updates finish.
- **`services/active-tab`:** follows `tabs.onActivated` plus `tabs.onUpdated` with a `url`
  change. It re-reads `tabs.query({ active: true, currentWindow: true })` (in a side panel,
  `currentWindow` is the panel's window), ignores stale async results, and emits an app event.
  This is the core of any panel that reacts to the current tab.
- **Cross-window sync through storage:** every panel window listens to `chrome.storage.onChanged`
  and reloads. Writes are serialized through a promise queue (read-modify-write). Settings live in
  `chrome.storage.local` under one key, and its `onChanged` keeps windows in step.
- **Testing caveat:** jsdom doesn't upgrade custom elements from `a11y-elements` (dropdown, modal,
  snackbar), so tests click their inner buttons directly and stub the snackbar's `notify`. That's
  an [app] dependency, but any web-component library will behave the same in testin-nutin.

---

## 2. Build outputs

### 2.1 Prod (`npm run build:extension` → `dist/src`, 392 KB; zip: 24 entries, 355 KB uncompressed)

```
manifest.json            ← written by package-extension (version from package.json)
background.js            ← bundled from src/extension/background.ts
index.html               ← Nutin build; css + module script injected, no inline script
bundle.<hash>.js         ← Nutin app bundle
main.<hash>.css
favicon.ico              ← from public/
assets/icons/*.png       ← from src/assets (anything under src/assets ships, e.g. ticknote.svg)
assets/fonts/**          ← .woff2 from src/assets, LICENSE.txt copied by package-extension
```

There's nothing else: no `.gz` or `.br` (removed), no sources, no maps, no `config/` (in prod,
the builder's `.json` copies stay in its temporary `dist-build` folder).

**CSP check (MV3 default `script-src 'self'`):**
- The built `index.html` has no inline `<script>`.
- `bundle.*.js` contains no `new Function` and no `eval(`, checked with grep on 2026-10-19.

Nutin's sanitizer builds DOM nodes and never uses `eval`, so the default CSP needs no changes.

### 2.2 Dev (`npm run build:extension:dev` → `dist/src`, 1.7 MB)

The dev build also leaves its working copies in `dist/src`:
- `app/` and `core/`, with the `.ts` sources and tsc's `.js` emit
- `config/`
- `bundle.js` and `background.js` with source maps

Chrome loads it fine, and the maps help debugging, but it's 4× the size and contains the sources.
**Never zip a dev build:** `package:extension` always builds prod first.

---

## 3. Manual steps

### 3.1 Day-to-day development

1. `npm run build:extension:dev` (or `build:extension`).
2. **First time:** open `chrome://extensions`, turn on **Developer mode**, click **Load unpacked**
   and pick `dist/src`.
3. **After every rebuild:** click the reload button on the extension's card. Then close and reopen
   the side panel: an open panel keeps the old code, and its `chrome.*` calls fail with "Extension
   context invalidated" until it's reopened.
4. **There is no watch or auto-reload.** `npm run dev`, `serve` and `serve:only` serve `dist/src`
   over HTTP, where `chrome` doesn't exist. The page still mounts (each init step is guarded,
   §1.6), but every `chrome.*` call fails with an error toast, so nothing loads or saves.
   Fast UI iteration happens through testin-nutin (the fake `chrome`) or rebuild + reload.
5. **Debugging:**
   - the panel: right-click inside it → *Inspect*
   - the service worker: the "service worker" link on the extension's card in `chrome://extensions`
6. **Keyboard shortcut:** a suggested key (`Alt+Shift+N`) is only applied if no other extension or
   Chrome command uses it. Check or change it in `chrome://extensions/shortcuts`.
7. **Automated checks in a real Chrome** (from NUTIN_KNOWLEDGE): branded Chrome ignores
   `--load-extension`. Use a headless throwaway profile with
   `--remote-debugging-pipe --enable-unsafe-extension-debugging` and CDP `Extensions.loadUnpacked`.

### 3.2 Assets

- **Extension files must be under `src/`.** The builder copies binary files, `.html` and `.ts` from
  `src/` (plus `.json` in prod) and, from `public/`, **only `favicon.ico`**. So:
  - icons go in `src/assets/icons/`, referenced from the manifest
  - anything non-binary that must ship (licenses, a `_locales/` folder for a translated manifest,
    `.txt`/`.md`) needs a copy step in `package-extension.js`. Today only font licenses are copied.
- Replace `public/favicon.ico` (the panel's tab icon) and the manifest icons when the artwork
  changes. Keep the manifest paths in sync.

### 3.3 Release (Chrome Web Store)

1. Bump `version` in `package.json` (the manifest follows it).
2. `npm run package:extension` → `dist/<name>-<version>.zip`. It needs the `zip` CLI: present on
   macOS and most Linux distributions, **not on Windows by default** (use WSL, or zip `dist/src`'s
   *contents* by hand).
3. In the developer dashboard (drafts in `docs/store-listing.md`):
   - Listing: name, summary (≤ 132 characters), category, description.
   - **Privacy practices:**
     - single purpose
     - a justification for *each* permission (the `tabs` one explains why `activeTab` doesn't fit
       a persistent panel)
     - "Remote code: No"
     - data usage checkboxes (URLs count as *web history*) and the three certifications
   - **Privacy policy URL:** host `PRIVACY.md` somewhere public (e.g. GitHub Pages).
   - **Images:**
     - the 128×128 icon
     - at least one screenshot, 1280×800 or 640×400
     - a 440×280 small promo tile
     - optionally, a 1400×560 marquee
4. Before submitting, check on a real (non-dev) install: the toolbar button and shortcut open
   the panel, and the panel follows tab switches.

---

## 4. Gaps and pitfalls found

| Finding | Impact | Where it would be fixed |
|---|---|---|
| `AppRouter` on `chrome-extension://<id>/index.html` shows the 404 view | multi-screen extension pages can't use the router | core: hash mode, or a configurable "index path" alias for `/` |
| i18n is URL-prefix based | no translated extension UI | core: a no-prefix i18n mode (language from settings/`navigator.language`); extension `_locales/` for manifest strings |
| `public/` → only `favicon.ico` is copied | icons/static files must move to `src/` | builder: copy all of `public/` (or an allow-list) |
| `.txt`/`.md`/other non-binary assets aren't copied | licenses and `_locales/*.json` need a post-step | builder: copy rule for `src/assets/**` regardless of extension, or `extension.copy` globs |
| Builder copies `src/extension` and tsc emits into it | post-step must delete `dist/src/extension` | builder: exclude-list from config, or the option owns the folder |
| Prod `.gz`/`.br` pre-compression | removed by the post-step | builder: `compress: false` option |
| Dev build ships sources, `core/`, `config/` (1.7 MB) | fine unpacked, never zip it | builder: clean dev output, or package-extension prunes |
| No watch + reload | manual reload after each build | option: `dev:extension` = builder watch + a dev-only reload hook (e.g. the worker polls a build stamp and calls `chrome.runtime.reload()`) |
| `dev`/`serve` can't host the page (`chrome` missing) | the dev server is useless for extension pages | option: inject the fake `chrome` in dev-serve, or document as unsupported |
| Background worker gets its own esbuild config | `drop: ['console']` and other `builder.esbuild` settings don't apply | option: reuse `builder.esbuild` for the worker |
| `zip` CLI dependency | Windows needs WSL or a manual zip | option: a pure-Node zip (no new dependency: `zlib` + a minimal writer), or a small dev dependency |
| Zip name hardcoded (`ticknote-`) | n/a for a template | option: from `package.json` `name` |
| Firefox: deferred | no build | option v2: `sidebar_action` instead of `side_panel`, `browser.*` (promise API; `chrome.*` mostly works), background `scripts` instead of `service_worker` (MV3 Firefox), `browser_specific_settings.gecko.id`, `action.theme_icons` for light/dark icons; build per target into `dist/<browser>` |

---

## 5. Porting proposal: `nutin add extension`

Following the existing feature mechanics: a `FEATURES` entry in
`lib/src/common/feature-registry.mjs`, files in `templates/features/extension/**`, and
`lib/src/add-feature/*` (`base-template-patcher`, `package-json-updater`,
`nutin-config-updater`), with tracking in `.nutin-meta.json`.

### 5.1 Template files (`templates/features/extension/`)

- `src/extension/manifest.json.hbs`: name and description from the app name, `version` placeholder,
  the surface (side panel / popup) from a prompt, base permissions (`storage` only; `sidePanel`
  for a side panel), icon paths under `assets/icons/`.
- `src/extension/background.ts.hbs` (and `.js` for `--js-only`): `setPanelBehavior` for a side
  panel; an empty worker with a comment for a popup.
- `src/assets/icons/icon-{16,32,48,128}.png`: placeholder artwork.
- `tools/extension/package-extension.js`: §1.3, generalized:
  - the zip name from `package.json`
  - copy globs from config
  - the worker reusing `builder.esbuild`'s `drop`/`target`
  - the worker optional (skipped when `src/extension/background.*` is absent)
- `src/app/services/chrome-api/…` and `src/app/testing/fake-chrome.js`: optional ("add the
  `chrome.*` wrapper and test fake?"), trimmed to `storage` + `tabs`.

### 5.2 Patches to the base template

- `package.json`:
  - scripts `build:extension`, `build:extension:dev`, `package:extension`
  - devDependency `@types/chrome` (TS only), installed with the Tailwind/markdown "install at
    build time" pattern, or added directly; to decide
- `tsconfig.json`: add `"chrome"` to `types` (append, keep existing entries), and add
  `src/extension` to `include`.
- `src/app/main.ts`: a router-less variant mounting a root component into `#app`.
  - `routes.ts`, `guards.ts` and the views get removed (or kept, if §4's router fix lands).
  - Generating a scratch app shows what the base `main.ts` looks like then.
- `src/index.html`: add `<title>`.
- `nutin.config.js`: an `extension: { surface: 'side-panel' | 'popup', copy: [...] }` block under
  the `// Nutin features` comment (its presence means the feature is on, like `markdownSources`).

### 5.3 Conflicts to block or warn about at `nutin add` time

- `generateSEOFiles: true`: meaningless; block it, or turn it off with a notice.
- `i18n: true`: the URL prefixes break; block until a no-prefix mode exists.
- App code importing `routes.ts` / `AppRouter`: warn, and point to §4.
- `docker`: unrelated (no server). Allow it, but note it's useless for the extension build.
- `markdown`: compatible in principle; its runtime uses routes, so the same router caveat applies.

### 5.4 Docs and changelog

- `CHANGELOG.md`: one bullet for the new feature.
- `resources/docs/OPTIONS_AND_FEATURES/HOWDOI_USE_EXTENSION_FEATURE.md` plus a hub entry. Cover
  §3's manual steps (load unpacked, reload, inspect, shortcuts, store checklist) and §4's limits.
- An AGENTS.md section for extension apps:
  - `chrome.*` only through the wrapper service
  - tests through the fake
  - no router
  - files the extension needs go under `src/`

### 5.5 Verification plan

- Scratch apps in the scratchpad, TS and `--js-only`: `nutin add extension` (side panel), then
  (popup). Check the files and patches, then `npm run build:extension` and `package:extension`.
  `diff -rq` the trees as usual.
- Headless Chrome load via CDP `Extensions.loadUnpacked` (§3.1 step 7): the manifest is accepted,
  the worker runs, and the page renders with no CSP violation in the console.
- testin-nutin passes in the generated app with the fake `chrome`.
- `nutin-update` on a project with the feature: the template files merge cleanly.

### 5.6 Open questions for Lois

1. **Surfaces:** side panel and popup as a prompt choice, or both? Options page (`options_ui`) too?
2. **Firefox in v1**, or Chrome only first? Ticknote deferred it.
3. **Watch and auto-reload** in v1 (§4), or a documented manual reload?
4. **Builder changes vs post-step:** copy all of `public/`, a `compress` flag, excluding
   `src/extension`. Teach the builder (cleaner, benefits every app), or keep everything in
   `package-extension.js` (no core/builder risk)? Ticknote proved the post-step works without
   touching the builder.
5. **Router:** add a hash/index-alias mode, so routed extension pages (options pages, multi-screen
   popups) work?
6. Ship the `chrome-api` wrapper and fake as part of the feature, or document them as a pattern
   only?

---

## 6. Unrelated framework notes found along the way (not part of the option)

The project's `AGENTS.md` gained clarifications while building Ticknote. They describe Nutin
behaviour in general and could go upstream separately:

- Frequent updates (timers, game loops): update a component's own DOM, or keep children; don't
  re-render whole views.
- Updating a kept child: there's no public setter. Give it an `update(data)` method and restore
  focus after re-renders.
- Catalog DOM: `<elementTag data-index>` wraps the item's own root. Use `props: { className }`,
  and know that the two wrappers break `dl`/grid direct-child structures.
- `data-optional="${value}"`, the interpolated form.
- `data-bind` doesn't work on `<select>`; `@value` reads only inputs, textareas and contenteditable
  (use `@target` for `<select>`). The full token list: `@checked`, `@selected`, `@name`, `@tag`,
  `@innerText`, `@html`, `@x`/`@y`, `@key`/`@code`.
- One `data-event` per element. Bind other events in `onAfterRender()` and push them onto
  `this.eventListeners`.
- SCSS build order: `main.scss` first, then each component `.scss` compiled alone and appended.
  Share code through `src/styles/base` partials.

---

## 7. Framework bug found in Ticknote's leak pass (2026-10-19): `render()` after `destroy()`

This is not extension-specific: it affects any Nutin app with async work. It was found while
hunting leaks in Ticknote, and reproduced with failing tests before the app-level fix.

### Problem

`BaseComponent.render()` (`src/core/base-classes/base-component/base-component.ts`, `render()`
around line 43) doesn't check whether the component was destroyed. `destroy()` unbinds events,
unsubscribes the bus listeners, destroys the children and removes the element, but leaves the
instance renderable. A later `render()`:

1. rebuilds the template into the detached element;
2. **composes new children** (`registerChildren()` runs again), whose constructors subscribe to the
   bus (`this.listen(...)`), start loads, etc.;
3. binds `data-event` listeners on the detached nodes.

Nothing will ever destroy those new children: the parent is already destroyed, and its registry was
cleared. Their bus subscriptions **leak for the page's lifetime** and keep reacting to events, e.g.
reloading data on every change.

### How it happens in practice

Any `await` followed by a re-render, when the component can be destroyed while waiting. Examples
from Ticknote, each reproduced by a test:

| Path | What leaked (measured with `AppEventBus.handlers`) |
|---|---|
| Settings panel: `await scopeStoreService.migrateTo(area)` → `finally { this.setBusy(false) }` → `render()`, after the user closed Settings | a new orphaned child (the delete section): **3 subscriptions** (`scope-content-changed`, `storage-area-changed`, `minute-tick`), each change triggering a full storage read |
| Note list: `await store.reorder(...)` fails → `refresh()` → `render()`, after the list was replaced (tab switch) | the list's items recreated: **3 `minute-tick` subscriptions** (one per note) |
| A pending `window` listener (drag) calling back into a destroyed component | same, through `update()` → `render()` |

Leaf components (no children) only produce detached garbage. The leak needs children with
subscriptions, which is the normal case for lists and panels.

### Workaround used in Ticknote

There's a `_destroyed` flag per component, set in `onBeforeDestroy()`, and every
async-reachable re-render returns early when it's set:

```ts
private _destroyed = false;

protected override onBeforeDestroy(): void {
  this._destroyed = true;
  super.onBeforeDestroy();
}

private refresh(): void {
  if (this._destroyed) return;   // a destroyed component would rebuild children nothing destroys
  this.config = …;
  this.render();
}
```

It's applied in four components (todo list, note list, settings panel, delete section). It's
easy to forget in the next component, which is why it belongs in core.

### Proposed fix in Nutin

1. `BaseComponent` tracks destruction: a private `_destroyed`, set at the start of `destroy()`,
   and a public read-only `isDestroyed` getter (so app code can also skip async work early, not
   just the render).
2. `render()` returns `this.element` without doing anything when destroyed, plus a
   `console.warn` in development: "render() called on a destroyed <ClassName>: ignored". The warning
   points at the late async path, which is usually a missing `isDestroyed` check or an
   unawaited promise.
3. `destroy()` itself becomes idempotent behind the same flag. Whether calling it twice is safe
   today wasn't checked.
4. Optionally `this.listen()` after destroy is a no-op with the same dev warning, for components
   that subscribe from async callbacks.

**Tests (core):**
- render after destroy builds no children (a child factory spy isn't called), binds nothing, and
  warns in dev
- `isDestroyed` flips
- a double `destroy()` is harmless
- a `listen()` after destroy doesn't subscribe

**Docs:** AGENTS.md "Base classes": "`render()` after `destroy()` is ignored; check `isDestroyed`
before async work whose result you'd render."

### Related app-level note

A11y-elements' `<body>` overlays need `removeOverlaysWithin()` on destroy, and before each render.
Ticknote does it in `src/app/lib/overlays.ts` (`removeOverlays()` + `delegateActions()`), which
could join §1.10's patterns worth templating. The library side is in
`a11y-plans/ticknote-feedback.md` §4.10.

---

## 8. Core change made in Ticknote (2026-10-19): `useEventBus()`, so `MockEventBus` reaches components

This is not extension-specific. It's **already applied in Ticknote's `src/core`**, with Lois's
go-ahead, so it needs to land upstream. Until it does, `nutin-update` may report conflicts in
`src/core/services/event-bus/event-bus.ts`, `event-bus.test.js` and `AGENTS.md`.

### Problem

testin-nutin ships `MockEventBus` "for constructor injection" (AGENTS.md), but nothing in a
generated app can receive it:
- `BaseComponent.listen()` and `destroy()` hardcode the `AppEventBus` singleton
  (`base-component.ts`: `AppEventBus.subscribe(...)`, `AppEventBus.off(...)`).
- The `Navigation` and `Lifecycle` facades take a bus in their constructor, but are built once at
  module load with `AppEventBus` (`navigation.facade.ts:25`, `lifecycle.facade.ts:61`).
- The router and i18n call `AppEventBus` directly, and app services do too.

So a mock created in a test never sees a component's subscriptions or a service's emits. Ticknote's
tests used the real bus instead, and its leak checks had to read `AppEventBus.handlers`, a private
field, to count subscriptions.

### Change (one core file)

In `src/core/services/event-bus/event-bus.ts`, add a module-level delegate. `EventBus`'s four public
methods forward to it while it's set. `AppEventBus` keeps its identity and type, so every existing
user follows without edits: `listen()`, the facades, the router, i18n and app code.

```ts
export type EventBusApi = Pick<EventBus, 'subscribe' | 'once' | 'emit' | 'off'>;
let delegate: EventBusApi | null = null;

// in subscribe / once / emit / off, first line:
if (delegate && delegate !== this) return delegate.subscribe(event, callback);   // (same for the others)

export function useEventBus(bus: EventBusApi | null): void {
  delegate = bus;
}
```

- `delegate !== this` means passing another real `EventBus` as the delegate can't recurse forever.
- The function is exported from the core barrel through `services/event-bus/index.ts` (`export *`).
- **Semantics:** a subscription stays on the bus it was made on. Install the mock before mounting or
  initializing, and restore the real bus (`useEventBus(null)`) after destroying.
- **Why not replace `AppEventBus` with a delegating object:** core tests call
  `AppEventBus.cleanupEventListeners()`, and the app's types expect an `EventBus`. The delegate
  inside the class keeps both working, and the diff stays in one file.

### Tests added (`event-bus.test.js`, `useEventBus` suite)

- `subscribe`, `once`, `emit` and `off` on `AppEventBus` go to the mock, and nothing reaches the real
  bus's handlers.
- `Navigation.navigateTo()` emits on the mock. A component's `listen()` subscribes on it, and
  `destroy()` unsubscribes from it.
- `useEventBus(null)` restores the real bus.

With them, the full run is 1,003 tests passing: framework and app, the 1,000 earlier ones plus the 3
new ones.

### Ticknote's tests now use the mock

- `testing/panel.js`: `startPanel()` installs a `MockEventBus` first, exposes it as `panel.bus`, and
  `stop()` restores the real bus. `busListenerCounts()` reads the mock's public `handlers` instead of
  the real bus's private field.
- Component tests emit on `panel.bus`. The four service test files that don't use `startPanel()`
  install their own mock in `beforeEach`.
- The leak checks still catch leaks. With the settings panel's destroyed guard disabled, its test
  fails with the same 3 orphaned subscriptions, now counted on the mock.

### Docs

AGENTS.md "Testing (testin-nutin)", next to the mocks line:

> `useEventBus(bus)` (from `core/index.js`) routes every `subscribe`/`once`/`emit`/`off` made
> through `AppEventBus` to `bus`, e.g. a `MockEventBus`: components' `listen()`, the
> `Navigation`/`Lifecycle` facades, the router, i18n and app services alike. `useEventBus(null)`
> restores the real bus. A subscription stays on the bus it was made on: install it before
> mounting or initializing (`beforeEach`), restore it after destroying (`afterEach`).

Upstream also needs:
- a CHANGELOG bullet
- the same line in the testing docs page
- the "for constructor injection" wording on `MockEventBus` updated, since it can now be installed
  globally

---

## 9. Updates from Notelet (2026-10-20)

_The project was renamed Ticknote → Notelet (`28a2c43`). Firefox support came in `609d07d`. This
section records what changed since §1–§8 were written: that commit, plus a CI/CD, bug-fix and
code-quality pass done on 2026-10-20 (not committed yet when this was written). `src/core/` and
`tools/builder/` are **still untouched**. The store listing drafts moved out of the repo, to
`../notelet-docs/store-listing.md`._

### 9.1 Firefox is done (updates §4's last row and §5.6 question 2)

The approach from §1 held: everything is still a post-step, now **one build per browser**.

- **Output:** `package-extension.js --browser chrome|firefox` copies `dist/src` into
  `dist/<browser>`, which is the extension root. `dist/src` stays as built, because testin-nutin
  runs against it. This replaces "`dist/src` is the extension root" in §1 and §2.
- **One manifest, Chrome's**, in `src/extension/manifest.json`. `toFirefox()` derives Firefox's:
  - `side_panel` → `sidebar_action` (`default_panel`, `default_title`, `default_icon`)
  - `background.service_worker` → `background.scripts: ['background.js']` (still `type: module`)
  - drops the `sidePanel` permission and `minimum_chrome_version`
  - renames the `_execute_action` command to `_execute_sidebar_action`
  - adds `browser_specific_settings.gecko`: `id` (the constant `GECKO_ID`; it can never change,
    because `storage.sync` data is tied to it), `strict_min_version: '140.0'`,
    `data_collection_permissions: { required: ['none'] }` (AMO now requires this key)
- **The worker is built per target** (`chrome116` / `firefox140`). `background.ts` branches on
  `chrome.sidePanel`: Chrome calls `setPanelBehavior`, and Firefox calls
  `browser.sidebarAction.toggle()` inside `action.onClicked`, because `toggle()` only works from
  a user action.
- **At runtime** the app tells the browsers apart by `chrome.runtime.getURL('')` starting with
  `moz-extension:` (`ChromeApiService.browser()`). It's used only where the text or the offered
  links differ (Firefox has no `chrome://` settings pages to open). The `chrome.*` namespace works
  in Firefox for everything else (storage, tabs).
- **Firefox's sync quota error** is a different string: `QuotaExceededError: storage.sync API call
  exceeded its quota limitations.` (`lib/errors.ts` maps both browsers' errors).
- **ZIP name** comes from `package.json` now: `dist/<name>-<browser>-<version>.zip`. §4's
  hardcoded-name row is done.
- **For the option:** `--browser` becomes a target list (`extension.browsers: ['chrome', 'firefox']`),
  `GECKO_ID` comes from config (prompted at `nutin add`, with the warning that it's permanent),
  and the manifest transform is reused as is.

### 9.2 Packaging and release, now generic and worth templating

All of it is in Notelet, under `tools/extension/` and `.github/`.

- **Reproducible ZIPs** (`zipForStore()`): entries sorted, every file's mtime set from
  `SOURCE_DATE_EPOCH` (CI sets it to the commit time; the fallback is 1980-02-01, since ZIP can't
  store earlier dates), `zip -X -D -q <archive> -@`, `TZ=UTC`, plus a `<zip>.sha256` file next to
  each ZIP. Two builds give the same bytes. CI checks that with a second build.
  It still needs the `zip` CLI (§4).
- **`tools/extension/validate-extension.js`** (`--browser`, optional `--tag vX.Y.Z`) checks:
  - **the manifest:** MV3, the required keys, every referenced file present, and the right shape
    per browser (gecko id, no `side_panel` in Firefox…);
  - **the ZIP's contents:** `manifest.json`, `index.html` and `background.js` at the root; no
    `*.map`, `*.gz`, `*.br`, `.DS_Store` or `extension/`; a `LICENSE.txt` next to the fonts; a
    size cap;
  - **the versions:** `package.json` = built manifest = `src/extension/manifest.json` = ZIP name
    = tag.
- **`web-ext` 10.8.0** as an exact devDependency, for `npm run lint:extension` (Mozilla's
  addons-linter on `dist/firefox`) and for AMO submission (`web-ext sign --channel listed
  --upload-source-code <git archive zip> --approval-timeout 0`).
- **GitHub Actions** (the option could ship them as optional templates):
  - `ci.yml`, on push and PR, also callable with `workflow_call`. It builds (the type check, see
    §9.3), runs the unit tests, then for each browser: package, validate, lint (Firefox), and
    check the build reproduces.
  - `release.yml`, on `v*.*.*` tags. It calls `ci.yml` with the tag, creates the GitHub Release
    with both ZIPs and their checksums (`gh release`), then submits to the stores behind a
    `store` environment with required reviewers.
  - The Chrome Web Store is reached with `curl` on the **v2 API**
    (`chromewebstore.googleapis.com/upload/v2/publishers/<publisher>/items/<item>:upload`, poll
    `:fetchStatus` while `IN_PROGRESS`, then `:publish`), so it needs a `CWS_PUBLISHER_ID`
    secret as well.
  - Hardening: third-party actions pinned to commit SHAs, `permissions: {}` by default, and
    Dependabot for `github-actions` and `npm`.
  - Both stores need the **first submission done by hand**: the CWS API only updates existing
    items, and AMO's first listed version needs listing metadata.
- **AMO review and the `innerHTML` warnings:** `web-ext lint` reports 10 `UNSAFE_VAR_ASSIGNMENT`.
  **5 come from Nutin's sanitizer** (`security.helper.ts`: `sanitizeToFragment`,
  `sanitizeTemplate`, `sanitizeAttributes`, `stripBindings`, `parseInContext`) and 5 from
  a11y-elements' sanitizer. They aren't errors, but a reviewer may ask about them. A ready-made
  reviewer note and answers are in `../notelet-docs/store-listing.md`, "Notes to reviewers:
  innerHTML". **For the option:** ship that note in the how-to doc. **For core (optional):** see
  §9.3.
- **Store notes:** AMO needs the sources whenever the code is minified (the release builds them
  with `git archive`). The Firefox linter also warns that `sidePanel.setPanelBehavior` (Chrome
  only, guarded) is unsupported, and that the manifest key isn't supported on Firefox for Android
  at that `strict_min_version`.

### 9.3 Nutin findings (core, builder, tooling): not extension-specific

1. **A plain `tsc --noEmit` doesn't work on a Nutin project.** The builder adds references to the
   `data-event` handlers before type-checking (`handler-refs.js`). Without them, every template
   handler is reported unused under `noUnusedLocals` (dozens of TS6133 errors). CI has to use
   `npm run build` as its type check. **Proposal:** a `typecheck` script that runs only the
   builder's merge + handler-refs + `tsc --noEmit` steps, or a note in AGENTS.md "Commands".
2. **Every build deletes all of `dist/`** (`finalize-build.js` → `replaceDir(temp, build)`), so
   `dist/chrome`, `dist/firefox` and the ZIPs are gone after any `npm run build`. CI and scripts
   must package after the last build. **For the option:** write extension output outside `dist/`
   (`dist-extension/`), or have the builder keep folders it doesn't own.
3. **A failed build leaves the previous `dist/` in place**, and `testin-nutin:only` then tests stale
   output and passes. It happened once in this session (a TS error, then "all green"). The chained
   scripts (`build && runner`) are fine. **Proposal:** the runner could warn when `dist/` is older
   than `src/`, or the builder could remove `dist/` before compiling.
4. **Stricter compiler options vs core** (the shared `tsconfig.json`):
   - `noImplicitReturns` and `noFallthroughCasesInSwitch` pass, and Notelet turned them on.
   - `noImplicitOverride` fails on 4 core services that redefine a `Service` member without
     `override`: `globals.ts:49`, `http-client.ts:52`, `i18n.ts:106` and `pipe-registry.ts:25`.
   - `noUnusedParameters` fails on 2 router helpers: `navigation-manager.helper.ts:66`
     (`currentPath`) and `route-guard-manager.helper.ts:13` (`targetPath`).
   - **Proposal:** fix these 6 lines in core and turn the 4 options on in the generated tsconfig.
5. **`render()` lets template exceptions through**, so one bad value blanks a whole view. In
   Notelet, a stored note without a valid `updatedAt` made `new Date(x).toISOString()` throw
   during render, and the panel came up empty. It's fixed at the app level now (stored items are
   validated and repaired, in `scope-store/scope-items.ts`). **Proposal (core):** a dev-mode
   `console.error` naming the component whose `generateTemplate()` threw, and possibly a per-child
   error boundary in `compose()`, so one child's error doesn't take its siblings down.
6. **Built-in `date` pipe locale.** `pipes.ts:19` defaults to `navigator.language`, so with
   `i18n: false` an English UI shows French dates in a French browser. Notelet's own `timeAgo`
   pipe now defaults to `document.documentElement.lang` (falling back to `'en'`) and caches its
   `Intl` formatter. **Proposal:** the same default for `date` (and `currency`'s locale).
7. **The `render()`-after-`destroy()` workaround (§7) is now one base class:**
   `components/base/app-component.ts` (`AppComponent`, with `protected destroyed` and
   `rerender(view)`), used by 5 components. It strengthens §7's case for `isDestroyed` in core:
   with that, the base class goes away.
8. **Focus across a re-render needed a helper:** `lib/focus.ts` `renderKeepingFocus(root,
   selectors, render)`. Preservation keeps focus inside *kept children* only; a component's own
   controls are rebuilt and lose it. Before the helper, four components each did this their own
   way. **Proposal:** document it in AGENTS.md, or a core option on `render()`.
9. **Catalog `keepBy` also needs the same `props` object** to keep an item. Changing options
   (e.g. "item picked up") rebuilds every item, and new `props` objects on each render rebuild
   them all. Notelet caches one options object per combination (`ItemOptionsCache` in
   `components/base/reorderable-list.ts`). **Proposal:** compare `props` shallowly in core, or
   document the requirement next to `keepBy`.
10. **Worth documenting in AGENTS.md** (Notelet relies on all three):
    - `data-component` placeholders are **replaced** by the child's root, and their attributes
      (`class`, `id`…) are copied onto it. So the parent's placeholder class controls where the
      child sits (e.g. `<div class="todo-item__add-item" data-component="checklist-add">` gets
      `flex-basis: 100%` from the parent).
    - `data-component="${expr}"` with an interpolated selector works, which flattens a template's
      conditionals.
    - A component can sit inline in a flex row with `tagName: 'span'` and `display: contents` on
      its root (Notelet's `ItemMenuComponent`).
11. **Unverified, to check: preservation without `Element.moveBefore`.** In Chrome 116–132 (which
    the manifest allows) and possibly Firefox 140, kept children are detached during the parent's
    render (`preservation.helper.ts`). If the browser fires `focusout` on the focused element,
    anything that reacts to focus loss (Notelet's keyboard reorder drops the item) misfires. It
    needs a hand test before any core change.
12. **npm 11 `allowScripts`:** `npm install` reported that the install scripts of `esbuild` and
    `@parcel/watcher` were blocked ("not covered by allowScripts"). Builds still worked (esbuild's
    platform binary comes in as an optional dependency), but generated projects may want an
    `allowScripts` entry, or a note in the docs.

### 9.4 Updates to §1.10 (app patterns worth templating)

- **Settings: one storage key per setting** (`settings:storageArea`, `settings:contentKind`…),
  not one `settings` object. With one object, any save writes back every other setting, and a
  window with a stale copy overwrote the storage area while another window was moving the notes to
  sync, so the panel looked empty. Saves are queued, values are validated, the legacy object is
  split once at `init()`, and the echo of a window's own write emits nothing new. For a template,
  that's the pattern to ship.
- **Each window has its own panel.** Chrome opens one side panel per window, and Firefox one
  sidebar, so a panel's write queue doesn't cover the other windows: two simultaneous
  read-modify-writes of the same item can lose one. It's documented as a known limitation. A real
  fix needs a cross-window lock (through the background script) or versioned items.
- **`ChromeApiService`:**
  - `openTab()`/`openInActiveTab()` refuse anything but `http(s):` URLs (plus an allow-list of
    the browser settings pages the panel links to), so no URL read from storage can navigate
    somewhere unexpected. That's for AMO review.
  - `browser()` (§9.1).
- **`ActiveTabService.init()`** now rejects when its *first* read fails, so `main.ts`'s guarded
  start reports it ("Couldn't read the current tab"). It used to swallow the error, and the panel
  then said "Notes aren't available on this page". Later reads still keep the last keys.
- **Stored data is validated on read** (`scope-items.ts` `normalizeItem`): it repairs what it can
  and drops what it can't. A write saves the list back as read, so dropping more than necessary
  would delete data for good. Synced storage can hold other versions' shapes, so a template
  should include this.
- **App-level helpers that could become template files:**
  - `lib/actions.ts` `runAction(failure, task, { focus, onError })`: the
    save → toast → focus pattern;
  - `lib/dom.ts` `requireElement()`;
  - `testing/fixtures.js`.
- **Overlays (§7, "Related app-level note"):** `lib/overlays.ts` is now used through one small
  component, `ItemMenuComponent` (the "⋯" trigger plus its `a11y-dropdown`). It removes its
  overlay before each render and when destroyed, and the items no longer handle overlays
  themselves.

### 9.5 Corrections to the sections above

- §1.1, §2.1: the extension root is `dist/<browser>`, not `dist/src` (§9.1).
- §1.3 step 7: the ZIP is reproducible, named `<name>-<browser>-<version>.zip`, and has a
  `.sha256` next to it (§9.2).
- §3.3: releases go through the tag workflow now; the manual steps are only the first store
  submissions and the secrets (Notelet's README, "CI/CD").
- §4: the "Firefox: deferred" and "Zip name hardcoded" rows are done.
- §5.6 question 2 is answered: Firefox can be in v1.
- Line 24 of this file holds a stray fragment ("Nutin's render() lets the exception through,"),
  apparently a note for §9.3 item 5. It can go.

## 10. Updates from the portfolio (2026-10-20)

### 10.1 Nutin findings (core)

1. **`@value` doesn't read `<select>` elements.** Nutin core limitation: the first try didn't switch
   panels. Nutin's `@value` token only reads `<input>` and `<textarea>`, so a `<select>` gave `''`.
   I passed `@target` instead and read the value in the handler, without touching core. The real
   fix would be adding `HTMLSelectElement` to `readInputValue` in
   `src/core/base-classes/base-component/helpers/token.helper.ts`.
   - Context: the portfolio's mobile tab picker (`tabs.component.html`,
     `data-event="change:_onPick:@target"`).
