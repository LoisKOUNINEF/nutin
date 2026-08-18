# Changelog

## 2.0.0

- Breaking:
  - Node engine requirement raised to `>=22` (was `>=18`).
  - Removed All libraries except `Pipes` since they didn't fit nutin's philosophy.
  - Removed `Store`: It created confusion and had questionable usefulness. Besides, services already handles what Store was supposed to.

- Main features
  - New central config file: `nutin.config.js` - Nutin features (i18n, inlineTemplates, tailwind), builder, generator, testing.
  - Can now use Tailwind (v4) as an optional utility layer alongside SASS.
  - Globally scoped stylesheets, co-located with feature files. **Use unique class names.** *Note: Nutin's naming convention encourages prefixes `home__header`*.
  - Optional SEO static files generation: `config/seo.json` is used by production builder to generate static HTML files to be served to bots, via real SSR of your components (only title, description and ogImage remain hand-authored content). Also generates `robots.txt` and `sitemap.xml` from `config/seo.json` (supports per-route `disallow` / `disallowBots`).
  - New interface `AppEvent` only for app-level events. Nutin internal events are no longer defined in `globals.d.ts`. Payload types are now objects.
  - EventBus exposes domain facades for navigation, lifecycle, and overlays events. Subscribing functions (`on*`) return a closure function to abstract unsubscription. it remains directly usable in app-level events / domain facades. Naming convention: `domain:event-name`.
```ts
// emit
Navigation.navigateTo('path');
// closure
const unsub = Navigation.onNavigate(this.doStuff);
// onDestroy
unsub()
```
  - i18n now uses URL: aligns with common practices & allows SEO to render static HTML files for each language.
  - New CLI command `nutin-add docker`
    Now supports brotli compression and all 4 package manager (npm, yarn, pnpm, bun) out of the box.
  - New CLI command `nutin-update` (update Nutin to latest patch / minor). `nutin-update` diffs your project against the new templates and merges changes, reporting any conflicts it can't resolve automatically.
  - TestinNutin: Added code coverage summary (branches / functions/ lines), `it.todo`, clock mocking (`setTimeout / setInterval`).
  - New file: `AGENTS.md` - gives LLMs the minimal context they need to start working with you in a Nutin project.

- Cleaner base classes responsibilities
  - BaseComponent responsibilities: Render lifecycle, Hydration, DOM lifecycle, Invalidation, Event subscriptions (DOM and bus), Teardown, Render guard, Composition orchestration.
  - Component responsibilities: Props (className, style, data-bindings, dynamic buttons), Config + defaults + normalization, Template generation via `templateFn`
  - View responsibilities: Route params, Navigation hooks (onEnter/onExit), Metadata policies, View identity (viewName)
  - EventBus methods with automatic unsubscribe: `listen(event, callback`, `listenToRenderEvents(events[])`. *Note*: `listenToRenderEvents`'s force` param has been removed - no longer needed.
  - AppEventBus can still be used directly if needed (`once`...) but must be unsubscribed manually via `onBeforeDestroy` hook.
  - Proper lifecycle hooks
```ts
onBeforeRender()
onAfterRender()
onBeforeDestroy()
onAfterDestroy()

// existing View hooks - called by router
onEnter()
onExit()
```
  - Service now exposes a single `getInstance()` method that accepts arguments, only on first call.

- Numerous bug fixes

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
