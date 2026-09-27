import fs from 'fs';
import path from 'path';
import { PATHS } from '../app/paths.js';
import { errorExit } from '../../../utils/index.js';

// A `dynamicFrom` marker route (e.g. `{ path: '/articles/:slug?', dynamicFrom: 'articles' }`)
// stands for every page in the matching compiled manifest (apps/website/generated/<name>.json,
// already built earlier in the pipeline by generate-docs.js). This expands each marker into one
// concrete route per page — real output URL, real title/description straight from the manifest,
// and enough to make ssr-render.js actually render that page's content (see `preloadManifest`).
//
// Ordinary static routes pass through unchanged, only gaining `outputPath` (defaulting to the
// same `path === '/' ? '' : path` derivation generate-seo-html.js/generate-sitemap-xml.js used
// inline before), so downstream code has one uniform field regardless of a route's origin.
export function expandDynamicRoutes(routes) {
  return routes.flatMap((route) => {
    if (!route.dynamicFrom) {
      return [{ ...route, outputPath: route.outputPath ?? (route.path === '/' ? '' : route.path) }];
    }

    const manifestPath = path.join(PATHS.tempSource, 'generated', `${route.dynamicFrom}.json`);
    let manifest;
    try {
      manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
    } catch (err) {
      errorExit(
        `Route "${route.path}" has "dynamicFrom": "${route.dynamicFrom}" but ${manifestPath} ` +
        `could not be read: ${err.message}`,
        'generate-seo-html'
      );
    }

    const manifestUrl = `/generated/${route.dynamicFrom}.json`;

    return Object.values(manifest.pages).map((page) => {
      // '/articles/:slug?' -> '/articles/<slug>', '/docs/:section?/:slug?' -> '/docs/<section>/<slug>' —
      // fill each dynamic segment so every expanded page gets a real, concrete URL.
      const params = { section: page.section, slug: page.slug };
      const outputPath = route.path.replace(/\/:(\w+)\??/g, (_, name) => {
        if (!params[name]) errorExit(`Route "${route.path}" uses unknown param ":${name}"`, 'generate-seo-html');
        return `/${params[name]}`;
      });
      const mockParams = Object.fromEntries(
        [...route.path.matchAll(/:(\w+)/g)].map(([, name]) => [name, params[name]])
      );

      return {
        path: route.path,
        outputPath,
        title: page.title,
        description: page.description,
        ogImage: route.ogImage,
        mockParams,
        mockFetch: { ...route.mockFetch, [manifestUrl]: manifest },
        preloadManifest: route.dynamicFrom,
      };
    });
  });
}
