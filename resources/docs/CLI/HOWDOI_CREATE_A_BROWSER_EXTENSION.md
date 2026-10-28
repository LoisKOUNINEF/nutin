# How do I create a browser extension?

Nutin can generate a Manifest V3 extension for Chrome and Firefox. Its UI is a normal Nutin app, shown in the browser's **side panel** (Firefox: the sidebar) or in a **popup** opened from the toolbar button. The choice is made when the project is created; it can't be added to an existing project.

```bash
nutin-new my-extension --extension side-panel
nutin-new my-extension --extension popup
nutin-new my-extension --extension            # asks which one
```

`--extension` takes an optional value, so the word after it is read as the surface: write the project's name first (`nutin-new my-app --extension`), or give the surface (`nutin-new --extension popup my-app`).

`--js-only` works too.

## What you get

```text
src/
  app/
    components/app/      -- the root component, mounted into <main id="app">
    services/chrome-api/ -- the one place that touches chrome.*
    main.ts              -- no router
  assets/icons/          -- placeholder icons, referenced by the manifest
  extension/
    manifest.json        -- Chrome's manifest; Firefox's is derived from it
    background.ts        -- the background script
tools/
  extension/             -- packaging and validation
```

Compared with a web app:

- **No router.** A side panel or popup only ever shows that one page. `main.ts` mounts `AppComponent` instead of calling `AppRouter()`. Compose the page from child components (`registerChildren()`).
- **No dev server.** The extension APIs (`chrome.*`) don't exist on an `http://` page, so there are no `serve`/`dev` scripts. Build, then reload the extension.
- **`nutin-add docker` and `nutin-add markdown` are refused.** There's no server, and Markdown pages need the router.

## Configuration

`nutin.config.js` has an `extension` block:

```js
extension: {
  browsers: ['chrome', 'firefox'],
  geckoId: 'my-extension@example.com',
},
```

- `browsers`: the browsers to build for. Remove one to skip it.
- `geckoId`: Firefox's add-on id. `storage.sync` data and addons.mozilla.org are tied to it, so **pick yours before the first release** (e.g. `name@your-domain`): it can never change afterwards.

The manifest is `src/extension/manifest.json`. Edit the name, description, icons and permissions there. Its `version` is replaced at build time by `package.json`'s, so a release only bumps `package.json`.

The generated manifest only asks for `storage`, plus `sidePanel` for a side panel. Add what your extension uses, and nothing more: each permission needs a justification in the stores. To read the active tab's URL (`chromeApiService.getActiveTabUrl()`), add `"tabs"`. `activeTab` isn't enough for a side panel, which stays open across tabs.

## Build and load

```bash
npm run build        # or build:prod
```

The build writes one unpacked extension per browser, next to `dist/src`:

- `dist/chrome`: in `chrome://extensions`, turn on **Developer mode**, click **Load unpacked**, and pick `dist/chrome`.
- `dist/firefox`: in `about:debugging#/runtime/this-firefox`, click **Load Temporary Add-on…** and pick `dist/firefox/manifest.json`. Firefox removes it when it restarts.

After each rebuild:

1. Reload the extension: the reload button on its card in `chrome://extensions`, or **Reload** in `about:debugging`.
2. Close and reopen the side panel or popup. An open panel keeps the old code, and its `chrome.*` calls fail with "Extension context invalidated" until it's reopened.

To debug, right-click inside the panel or popup and pick **Inspect**. For the background script, use the "service worker" link on the extension's card in Chrome, or **Inspect** in `about:debugging` in Firefox.

The side panel's toolbar button opens and closes it. To add a keyboard shortcut, use `chrome://extensions/shortcuts` in Chrome, or **Manage Extension Shortcuts** in `about:addons` in Firefox. You can also suggest a default one in the manifest (`commands._execute_action.suggested_key`); the browser only applies it if no other extension uses it.

## What ships

Everything in `dist/<browser>` is the extension: the built page (`index.html`, `bundle.<hash>.js`, `main.<hash>.css`), every file from `public/` and `src/assets/`, `background.js` and `manifest.json`. The sources, source maps of a prod build, and compressed copies aren't there.

- **Files the manifest references must be in `public/` or `src/assets/`.** For example, `public/_locales/en/messages.json` ends up at the extension's root, where the browser looks for a translated manifest (`"name": "__MSG_name__"`).
- **Absolute URLs work.** `/favicon.ico`, `/main.<hash>.css` and `url('/assets/fonts/…')` resolve against the extension's root.
- **The default extension CSP is enough.** The built page has no inline script, and Nutin never uses `eval` or `new Function`. Don't load remote scripts or fonts: bundle them under `src/assets/`, as both stores require.
- **The background script** is bundled from `src/extension/background.ts` with `builder.esbuild`'s settings, so `drop: ['console']` removes its `console` calls in prod builds too.

## Using the extension APIs

Go through `src/app/services/chrome-api/chrome-api.service.ts` rather than calling `chrome.*` from components:

```ts
import { chromeApiService } from '../../services/chrome-api/chrome-api.service.js';

const { theme } = await chromeApiService.storageGet('sync', ['theme']);
const off = chromeApiService.onStorageChanged((changes) => { /* ... */ });
```

It covers storage (`local`, `sync` and `session`: get, set, remove, change events), the active tab's URL and tab changes, `openTab()` (http(s) pages only), and `browser()` (Chrome or Firefox). Add the APIs you use to it. Firefox implements the same `chrome.*` namespace for most of them; `browser()` tells the two apart where they differ.

- It reads `chrome` on every call, so a test can install a fake `chrome` first. If you test with testin-nutin, `tools/testin-nutin/mocks/fake-chrome.js` is one: `installFakeChrome({ url })` before each test, `uninstallFakeChrome()` after. It has events, storage areas that clone values like the real ones (and `failNextSet` to simulate a quota error), and tabs with `activateTab(url)`/`navigate(url)` helpers.
- `chrome.*` calls can fail. The extension may have been reloaded under an open panel, or storage may be over its quota. Report those errors in the page rather than leaving it blank.
- Each window has its own side panel. To keep several windows in step, listen to `onStorageChanged` and re-read.

## Package and release

```bash
npm run package:extension          # prod build, then dist/<name>-<browser>-<version>.zip (+ .sha256) per browser
npm run package:extension:chrome   # one browser
npm run validate:extension         # checks the packages (add -- --tag vX.Y.Z on a release)
npm run lint:extension             # Mozilla's web-ext lint, on dist/firefox
```

- **The ZIPs are reproducible.** Their entries are sorted, and every file's time comes from `SOURCE_DATE_EPOCH` (set it to the commit's time in CI, e.g. `git log -1 --format=%ct`), or a fixed date. Two builds of the same sources give the same bytes and the same `.sha256`.
- **Packaging needs the `zip` command.** It's there on macOS and most Linux distributions, but not on Windows (use WSL). Packaging refuses a dev build.
- **`validate:extension` checks each package:**
  - the manifest's shape for its browser;
  - every file the manifest references;
  - that the package holds no source maps, compressed copies or sources;
  - that the manifest's version matches `package.json` (and the tag).
- **The scripts are made for CI:** one `package:extension:<browser>` per job, then `validate:extension -- --browser <browser>`, then `lint:extension` for Firefox.

### Store submissions

The first submission to each store is done by hand: the Chrome Web Store API only updates existing items, and a first listed version on addons.mozilla.org (AMO) needs its listing metadata. After that, updates can be automated.

For both stores, you need:

- **A listing:** name, summary (132 characters at most in the Chrome Web Store), description and category.
- **Privacy details:**
  - a single purpose;
  - a justification for **each** permission;
  - "remote code: no";
  - what data you collect, if any (URLs count as browsing history);
  - a privacy policy URL.
- **Images:** the 128×128 icon, and at least one screenshot (1280×800 or 640×400). The Chrome Web Store also needs a 440×280 promo tile.

On AMO, also:

- **Upload the sources.** The bundle is minified, so AMO asks for them (`git archive` of the release), with the build steps: Node 24+, `npm ci`, `npm run package:extension:firefox`.
- **Declare what you collect** in `browser_specific_settings.gecko.data_collection_permissions`. It's `none` by default.

Before submitting, check the extension on a real, non-temporary install. The toolbar button should open the side panel or popup, and the page should work after a browser restart.

### `web-ext lint` warnings

`lint:extension` should report no errors. Some warnings are expected:

- `UNSUPPORTED_API`: `sidePanel.setPanelBehavior`. It's Chrome-only, and the background script only calls it when `chrome.sidePanel` exists.
- A warning that `data_collection_permissions` needs a newer Firefox for Android than `strict_min_version`.
- `UNSAFE_VAR_ASSIGNMENT` ("Unsafe assignment to innerHTML"): 5 of them come from Nutin's sanitizer (`src/core/base-classes/base-component/helpers/security.helper.ts`: `sanitizeToFragment()`, `sanitizeTemplate()`, `sanitizeAttributes()`, `stripBindings()`, `parseInContext()`).

An AMO reviewer may ask about the `innerHTML` warnings. This note, pasted into **Notes to reviewers**, usually answers it (adapt the data sources and the dependencies to your extension):

> The "Unsafe assignment to innerHTML" warnings come from the HTML sanitizer of Nutin, the UI framework, whose sources are in the uploaded archive (`src/core/base-classes/base-component/helpers/security.helper.ts`). It doesn't write markup into the page: each assignment targets the `innerHTML` of a detached `<template>` element, whose content belongs to an inert document, where nothing loads, runs or renders. The parsed nodes are then cleaned (`<script>`, `<style>`, `<link>`, `<base>`, `<meta>`, `on*` handlers, `srcdoc` and `javascript:` URLs are removed) and inserted with `replaceChildren()`, so the cleaned markup is never parsed a second time. Every dynamic value goes through an `html` tagged template that HTML-escapes it before parsing. The extension loads no remote code, uses no `eval`, and keeps Firefox's default extension CSP. Build steps: Node 24+, `npm ci`, `npm run package:extension:firefox`.

## Limits

- **One page.** There's no router, so an options page (`options_ui`) or a multi-screen popup has to switch views by itself (e.g. a parent component choosing its child with `data-component="${config.screen}"`).
- **No translated UI through Nutin's i18n**, which is URL-based. The manifest's own strings can be translated with `_locales/` (see "What ships").
- **No watch or auto-reload.** Rebuild, then reload the extension.
- Chrome 116+ and Firefox 140+ (desktop). Firefox for Android and Safari aren't targeted.
