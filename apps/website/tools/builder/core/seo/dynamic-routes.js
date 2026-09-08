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
    // '/articles/:slug?' -> '/articles' — strip the trailing dynamic segment so each
    // expanded page gets a real, concrete URL instead of the literal ":slug?" pattern.
    const basePath = route.path.replace(/\/:[^/]+\??$/, '');

    return Object.values(manifest.pages).map((page) => ({
      path: route.path,
      outputPath: `${basePath}/${page.slug}`,
      title: page.title,
      description: page.description,
      ogImage: route.ogImage,
      mockParams: { slug: page.slug },
      mockFetch: { ...route.mockFetch, [manifestUrl]: manifest },
      preloadManifest: route.dynamicFrom,
    }));
  });
}
