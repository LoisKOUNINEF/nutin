import fs from 'fs';
import path from 'path';
import { PATHS } from '../app/paths.js';
import { print, errorExit } from '../../../utils/index.js';
import { applySubstitutions } from './html-substitutions.js';
import { getAppRoutePaths } from './ssr/ssr-render.js';
import { builderConfig } from '../../builder.config.js';

export function segmentsOf(routeSuffix) {
  return routeSuffix ? routeSuffix.split('/').filter(Boolean) : [];
}

export function validateMockParams(route) {
  const requiredParams = [...route.path.matchAll(/:([^/]+)/g)]
    .map(([, name]) => name)
    .filter((name) => !name.endsWith('?')); // optional segments don't require a mock value

  if (requiredParams.length === 0) return;

  const provided = route.mockParams ?? {};
  const missing = requiredParams.filter((name) => !(name in provided));

  if (missing.length > 0) {
    errorExit(
      `Route "${route.path}" has dynamic segment(s) but is missing "mockParams" ` +
      `for: ${missing.join(', ')}. Add a "mockParams" object to this route in config/seo.json.`
      , 'generate-seo-html'
    );
  }
}

export async function writeRouteHtml({ template, lang, title, description, pageUrl, ogImage, body, outputSegments, routePath }) {
  let html = applySubstitutions(template, lang, title, description, pageUrl, ogImage);

  if (html === template) {
    errorExit(`Failed to apply any changes for ${routePath} (lang "${lang}") — index.html may be missing a </head> tag`, 'generate-seo-html');
  }

  html = html.replace(
    /<main\s+id=["']app["'][^>]*>[\s\S]*?<\/main>/,
    `<main id="app">\n${body}\n  </main>`
  );

  const outputDir = path.join(PATHS.tempSource, ...outputSegments);
  const outputPath = path.join(outputDir, 'index.html');

  fs.mkdirSync(outputDir, { recursive: true });
  fs.writeFileSync(outputPath, html, 'utf-8');
}

export async function warnForRoutesMissingSeoConfig(bundleUrl, seoRoutes, defaultLanguage, baseUrl) {
  const appRoutePaths = await getAppRoutePaths(bundleUrl, defaultLanguage, baseUrl);
  const seoRoutePaths = new Set(seoRoutes.map((route) => route.path));

  for (const path of appRoutePaths) {
    if (seoRoutePaths.has(path)) continue;

    if (builderConfig.WELL_KNOWN_NON_SEO_ROUTES.includes(path)) {
      continue;
    } else {
      print.error(`[generate-seo-html] Route "${path}" has no matching entry in config/seo.json; consider adding it so this route gets SEO HTML, sitemap, and meta tags.`);
    }
  }
}
