import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';

// nutin.config.js keys only the tooling reads — never worth shipping to the browser.
// markdownSources reaches the markdown feature's runtime through a define instead (see
// sharedDefine), so it's only bundled where that code is.
const TOOLING_ONLY_KEYS = ['builder', 'testinNutin', 'dockerPorts', 'markdownSources'];

const NUTIN_CONFIG_FILTER = /[\\/]nutin\.config\.js$/;
const SEO_JSON_FILTER = /[\\/]seo\.json$/;
const CORE_CONFIG_IMPORTER = /[\\/]core[\\/]config\.(ts|js)$/;
const SLIM_SEO_NAMESPACE = 'nutin-slim-seo';

/**
 * esbuild `define`s shared by the client and SSR bundles. `globalThis.__NUTIN_I18N__`
 * lets esbuild fold core's i18n guards to a constant and drop the i18n code when it's off.
 * `globalThis.__NUTIN_MARKDOWN_SOURCES__` (the markdown feature's source folders) is only
 * emitted where code reads it, so an app without that code ships none of it.
 */
export function sharedDefine({ isProd, i18n, markdownSources }) {
  return {
    'process.env.NODE_ENV': isProd ? '"production"' : '"development"',
    'globalThis.__NUTIN_I18N__': JSON.stringify(Boolean(i18n)),
    // A JSON *string* literal: esbuild inlines and folds it (`define ?? fallback`), while
    // an array define is hoisted into a variable and keeps the fallback code around.
    'globalThis.__NUTIN_MARKDOWN_SOURCES__': JSON.stringify(JSON.stringify(markdownSources?.sourceFolders ?? [])),
  };
}

/**
 * Keeps tooling-only config out of the client bundle:
 * - nutin.config.js loses its TOOLING_ONLY_KEYS (app code may read any other key);
 * - config/seo.json, as imported by core/config.ts, keeps only each route's path and title.
 */
export function slimConfigPlugin({ generateSEO }) {
  return {
    name: 'nutin-slim-config',
    setup(build) {
      build.onLoad({ filter: NUTIN_CONFIG_FILTER }, async (args) => {
        const { default: config } = await import(pathToFileURL(args.path).href);
        const slim = slimNutinConfig(config);
        // Not plain data (a function, a RegExp, ...): JSON can't carry it, so ship the file as-is.
        if (!slim) return undefined;
        return { contents: `export default ${JSON.stringify(slim)};`, loader: 'js' };
      });

      build.onResolve({ filter: SEO_JSON_FILTER }, (args) => {
        if (!CORE_CONFIG_IMPORTER.test(args.importer)) return undefined;
        return { path: path.resolve(args.resolveDir, args.path), namespace: SLIM_SEO_NAMESPACE };
      });

      build.onLoad({ filter: /.*/, namespace: SLIM_SEO_NAMESPACE }, (args) => {
        const seo = JSON.parse(fs.readFileSync(args.path, 'utf-8'));
        return { contents: JSON.stringify(slimSeoConfig(seo, generateSEO)), loader: 'json' };
      });
    },
  };
}

export function slimNutinConfig(config) {
  const slim = Object.fromEntries(
    Object.entries(config ?? {}).filter(([key]) => !TOOLING_ONLY_KEYS.includes(key))
  );
  return isPlainData(slim) ? slim : null;
}

// The client only reads seo.json to resolve document titles (see NavigationManager.updateDocumentTitle).
export function slimSeoConfig(seo, generateSEO) {
  if (!generateSEO) return {};
  const routes = Array.isArray(seo?.routes) ? seo.routes : [];
  return { routes: routes.map(({ path, title }) => ({ path, title })) };
}

export function isPlainData(value) {
  if (value === null || ['string', 'number', 'boolean'].includes(typeof value)) return true;
  if (Array.isArray(value)) return value.every(isPlainData);
  if (typeof value === 'object' && Object.getPrototypeOf(value) === Object.prototype) {
    return Object.values(value).every(isPlainData);
  }
  return false;
}
