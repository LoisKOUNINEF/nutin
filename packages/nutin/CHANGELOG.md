# Changelog

## V1.3.0

Version 1.3.0 marks a stability milestone with various improvements and refinements, making this the recommended version for new projects.

- Security
    - Added template sanitization with trustLevel (`'strict' | 'normal' | 'trusted'` default: `'normal'`) that can be passed to component's `super()`.
        - trusted : no template sanitization
        - normal : remove scripts and inline event handlers
        - strict : remove iframe, object, embed, href, data: protocol, scripts and inline event handlers

- Builder
    - Now adds stylesheet & script tags in `index.html` on build time (`add-tags.js`)
    - (Production) Added file hashing (js & css) (`hash-files.js`)
    - (Production) Added Gzip and Brotli compression (`compress-files.js`). Configurable in `builder.config.js`
        - **Note : default deployment helpers do NOT support Brotli compression.** If you want to use it :
            - uncomment brotli-related sections (`BROTLI OPTIONAL`) in `builder.config.js` and `tools/builder/core/compress-files.js`
            - enable brotli in nginx.conf
            - You'll also need to use an existing Brotli-enabled nginx image or build your own from source.

- Deployment tools
    - Enabled gzip globally in `nginx.conf` and removed `gzip.conf` (compress during build).

- StylinNutin
    - Added utility classes `u-text-center`, `u-text-right`, `u-text-left`, `u-font-primary`
    - box-shadow variables now use `$primary-color`

- TestinNutin
    - Now applies `setupJsdom()` as beforeAll (was beforeEach) and `teardownJsdom()` as afterAll (was afterEach) in `test-queue.js` (improved efficiency / speed)

- Global minor improvements & fixes
    - Reorganized methods in classes to improve readability and added function return types where missing
    - `getFilesRecursive` method (tools/utils) now accepts both string and array of strings for `extension` argument
    - CLI : 
        - Fixed CLI prompts (`build-context.mjs` no longer overrides answers)
        - Cleaned `file-generator.mjs` (extracted methods in `project-generator.mjs` and `json-generator.mjs`)

## V1.2.3

- `nginx.conf` : fixed multi-line CSP map warning (single line map)

## V1.2.2

- Fixed Nginx security headers in child location blocks.

- Fixed package manager variable in `dev-serve.js.hbs` runCommand

- Removed ghost files

## V1.2.1

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

## V1.2.0

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

## V1.1.0

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

## V1.0.2

- Partially fixed `npm run dev` script when using internal templates. *Page still needs to be reload manually from time to time.*

## V1.0.1

- Fixed typo issue when using i18n feature
