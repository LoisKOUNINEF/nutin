import fs from 'fs';
import path from 'path';
import { PATHS } from '../app/paths.js';
import { builderConfig } from '../../builder.config.js';
import { routeSuffixOf } from './route-output.js';
import { resolveSeoRoutes } from './seo-routes.js';

// `skippedSuffixes`: routeSuffixOf() of routes generate-seo-html.js didn't prerender
// because a guard refused them.
export function collectUrls(baseUrl, routes, languages, { i18n = builderConfig.i18n, skippedSuffixes = new Set() } = {}) {
  const urls = [];

  for (const route of routes) {
    // Disallowed for every bot in robots.txt — listing it here would contradict that.
    if (route.disallow === true) continue;
    const routeSuffix = routeSuffixOf(route);
    if (skippedSuffixes.has(routeSuffix)) continue;

    if (i18n) {
      for (const lang of languages) {
        urls.push(`${baseUrl}/${lang}${routeSuffix}/`);
      }
    } else {
      urls.push(`${baseUrl}${routeSuffix}/`);
    }
  }

  return urls;
}

function escapeXml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function buildSitemapXml(urls) {
  const urlEntries = urls.map(loc => `  <url>\n    <loc>${escapeXml(loc)}</loc>\n  </url>`).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urlEntries}\n</urlset>\n`;
}

export function generateSitemapXml(skippedSuffixes = new Set()) {
  const seoConfigPath = path.join(PATHS.temp, 'config', 'seo.json');
  const seoConfig = JSON.parse(fs.readFileSync(seoConfigPath, 'utf-8'));
  const baseUrl = seoConfig.baseUrl.replace(/\/$/, '');

  const languagesConfigPath = path.join(PATHS.temp, 'config', 'languages.json');
  const { languages } = JSON.parse(fs.readFileSync(languagesConfigPath, 'utf-8'));

  const urls = collectUrls(baseUrl, resolveSeoRoutes(seoConfig), languages, { skippedSuffixes });
  const xml = buildSitemapXml(urls);

  const outputPath = path.join(PATHS.tempSource, 'sitemap.xml');
  fs.writeFileSync(outputPath, xml, 'utf-8');
}
