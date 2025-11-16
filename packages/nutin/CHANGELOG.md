# Changelog

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

  See [DEPLOYMENT.md file](../../docs/DEPLOYMENT_HELPERS.md) for details.

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

  See [DEPLOYMENT.md file](../../docs/DEPLOYMENT_HELPERS.md) for details.

- stylin-nutin (generator)
    - When generating a component, prompts (boolean) to generate a `_component-name.scss` file in `styles/components` (forwarded by `stymes/components/_index.scss`).

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
