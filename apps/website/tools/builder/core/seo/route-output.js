import fs from 'fs';
import path from 'path';
import { PATHS } from '../app/paths.js';
import { print, errorExit } from '../../../utils/index.js';
import { applySubstitutions } from './html-substitutions.js';
import { getAppRoutePaths } from './ssr/ssr-render.js';
import { builderConfig } from '../../builder.config.js';

const APP_CONTAINER = /(<([a-zA-Z][\w-]*)\b[^>]*\sid=["']app["'][^>]*>)[\s\S]*?<\/\2>/;

// The concrete URL path a seo.json route is prerendered at: `outputPath` when given,
// otherwise `path` with each `:param` filled from `mockParams` (an unset optional
// `:param?` segment is dropped). '/' maps to '' so it can be appended to baseUrl.
export function routeSuffixOf(route) {
  const resolved = route.outputPath ?? route.path.replace(/\/:([^/?]+)\??/g, (_match, name) => {
    const value = route.mockParams?.[name];
    return value === undefined || value === '' ? '' : `/${encodeURIComponent(value)}`;
  });
  return resolved === '/' || resolved === '' ? '' : resolved.replace(/\/$/, '');
}

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

export async function writeRouteHtml({ template, lang, title, description, pageUrl, ogImage, body, navbar = '', footer = '', outputSegments, routePath, hreflangLinks }) {
  let html = applySubstitutions(template, lang, title, description, pageUrl, ogImage, hreflangLinks);

  if (html === template) {
    errorExit(`Failed to apply any changes for ${routePath} (lang "${lang}") — index.html may be missing a </head> tag`, 'generate-seo-html');
  }

  // Any element can be the #app mount (validate-html.js only checks for id="app"), and
  // its opening tag is kept as authored. The replacement goes through a function so `$&`,
  // `$'`… in the rendered markup stay literal.
  if (!APP_CONTAINER.test(html)) {
    errorExit(`index.html has no closed id="app" container to render ${routePath} into`, 'generate-seo-html');
  }
  // Website: the prerendered navbar/footer globals surround the #app container.
  html = html.replace(APP_CONTAINER, (_match, openTag, tagName) => `${navbar}\n${openTag}\n${body}\n  </${tagName}>\n${footer}`);

  const outputDir = path.join(PATHS.tempSource, ...outputSegments);
  const outputPath = path.join(outputDir, 'index.html');

  fs.mkdirSync(outputDir, { recursive: true });
  fs.writeFileSync(outputPath, html, 'utf-8');
}

// `optOutPaths`: app route patterns deliberately without SEO pages (e.g. a Markdown source
// with "seo: false").
export async function warnForRoutesMissingSeoConfig(bundleUrl, seoRoutes, defaultLanguage, baseUrl, optOutPaths = []) {
  const appRoutePaths = await getAppRoutePaths(bundleUrl, defaultLanguage, baseUrl);
  const seoRoutePaths = new Set([...seoRoutes.map((route) => route.path), ...optOutPaths]);

  for (const path of appRoutePaths) {
    if (seoRoutePaths.has(path)) continue;

    if (builderConfig.WELL_KNOWN_NON_SEO_ROUTES.includes(path)) {
      continue;
    } else {
      print.error(`[generate-seo-html] Route "${path}" has no matching entry in config/seo.json; consider adding it so this route gets SEO HTML, sitemap, and meta tags.`);
    }
  }
}
