# Changelog

## V1.0.1

- Fixed typo issue when using i18n feature

## V1.0.2

- Partially fixed `npm run dev` script when using internal templates. *Page still needs to be reload manually from time to time.*

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

## V1.2.0

- Fixed `npm run dev` command. Added middleware to reload nested routes.

- Improved `data-optional` tag:
  > Can now specify which attribute to check with `data-optional="attrName"` (`src`, `href`, ...)                           
  > Now works for `img`, `input`, etc

- Event Bus : 
  > Tracks both event name + callback.                           
  > cleanupEventListeners now works correctly.                           
  > New property: `once`. `once` subscriptions automatically remove themselves after first call.

- HTTP client : 
  > Optional request / response interceptors.                           
  > Full timeout / abort controller support preserved.                           
  > onDestroy now clears interceptors to prevent memory leaks.

- Improved builder

  Implemented `esbuild` & `html-minifier-terser`.                                 
  Added flags `--bundle` (for production-ready build. *`npm run build --bundle` is equivalent to `npm run build:prod`)* and `--log` (verbose output). **Doesn't work with yarn or bun**.                                
  Commands: `npm run build`, `npm run build:prod`,  `npm run serve:only`, `npm run serve`, `npm run dev`.                            

  *Note: `--prod` or `--production` will set NODE_ENV to production, and have the same effect as `--bundle`.* `const isProd = process.env.npm_config_bundle || process.env.NODE_ENV === 'production';`

- Improved default Dockerfile (nginx conf + gzip)

  **NOTE :***Update nginx.conf as needed. Example: CSP connect-src if the app makes API calls.*
