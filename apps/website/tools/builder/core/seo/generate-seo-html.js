import fs from 'fs';
import path from 'path';
import { PATHS } from '../app/paths.js';
import { print, errorExit } from '../../../utils/index.js';
import { buildSsrBundle, cleanupSsrBundle } from './ssr/ssr-bundle.js';
import { renderRoute } from './ssr/ssr-render.js';
import { builderConfig } from '../../builder.config.js';
import { resolveLocaleValue, valueForLangWithFallback, collectI18nSeoIssues } from './i18n-resolution.js';
import { segmentsOf, validateMockParams, writeRouteHtml, warnForRoutesMissingSeoConfig } from './route-output.js';
import { expandDynamicRoutes } from './dynamic-routes.js';

// og:image/twitter:image require an absolute URL for Discord/Twitter to resolve them;
// every other absolute field (og:url, canonical) is already baseUrl-prefixed, so ogImage
// (a repo-relative path in config/seo.json) needs the same treatment.
function toAbsoluteUrl(urlOrPath, baseUrl) {
  if (!urlOrPath) return urlOrPath;
  return /^https?:\/\//.test(urlOrPath) ? urlOrPath : `${baseUrl}${urlOrPath}`;
}

async function processRoute(template, baseUrl, defaultLanguage, languages, route, bundleUrl) {
  validateMockParams(route);

  const routeSuffix = route.outputPath;

  if (builderConfig.i18n) {
    // Same for every language variant of this route — lets crawlers know these URLs
    // are alternates of one page rather than duplicate/competing content. x-default
    // points at the default language since that's also where nginx redirects an
    // unprefixed request to (see tools/docker/nginx.conf's "location = /").
    const hreflangLinks = [
      ...languages.map((l) => ({ hreflang: l, href: `${baseUrl}/${l}${routeSuffix}/` })),
      { hreflang: 'x-default', href: `${baseUrl}/${defaultLanguage}${routeSuffix}/` },
    ];

    for (const lang of languages) {
      const title = valueForLangWithFallback(route.title, lang, defaultLanguage);
      const description = valueForLangWithFallback(route.description, lang, defaultLanguage);
      const ogImage = toAbsoluteUrl(valueForLangWithFallback(route.ogImage, lang, defaultLanguage), baseUrl);

      const pageUrl = `${baseUrl}/${lang}${routeSuffix}`;
      const body = await renderRoute({
        bundleUrl,
        appRoutesKey: route.path,
        mockParams: route.mockParams,
        mockFetch: route.mockFetch,
        preloadManifest: route.preloadManifest,
        lang,
        pageUrl,
        i18nEnabled: builderConfig.i18n,
      });

      await writeRouteHtml({
        template, lang, title, description, pageUrl, ogImage, body, hreflangLinks,
        outputSegments: [lang, ...segmentsOf(routeSuffix)],
        routePath: route.path,
      });
    }
  } else {
    const title = resolveLocaleValue(route.title, defaultLanguage);
    const description = resolveLocaleValue(route.description, defaultLanguage);
    const ogImage = toAbsoluteUrl(resolveLocaleValue(route.ogImage, defaultLanguage), baseUrl);

    if (!title || !description) {
      errorExit(`Missing title or description for route "${route.path}" in seo.json`, 'generate-seo-html');
    }

    const pageUrl = `${baseUrl}${routeSuffix}`;
    const body = await renderRoute({
      bundleUrl,
      appRoutesKey: route.path,
      mockParams: route.mockParams,
      mockFetch: route.mockFetch,
      preloadManifest: route.preloadManifest,
      lang: defaultLanguage,
      pageUrl,
      i18nEnabled: builderConfig.i18n,
    });

    await writeRouteHtml({
      template, lang: defaultLanguage, title, description, pageUrl, ogImage, body,
      outputSegments: segmentsOf(routeSuffix),
      routePath: route.path,
    });
  }
}

export async function generateSeoHtml() {
  const templatePath = path.join(PATHS.tempSource, 'index.html');
  const template = fs.readFileSync(templatePath, 'utf-8');

  if (!template.includes('</head>')) {
    errorExit('index.html is missing a </head> tag — cannot inject SEO tags', 'generate-seo-html');
  }

  const seoConfigPath = path.join(PATHS.temp, 'config', 'seo.json');
  const seoConfig = JSON.parse(fs.readFileSync(seoConfigPath, 'utf-8'));
  seoConfig.routes = expandDynamicRoutes(seoConfig.routes);
  const baseUrl = seoConfig.baseUrl.replace(/\/$/, '');

  const languagesConfigPath = path.join(PATHS.temp, 'config', 'languages.json');
  const { languages, defaultLanguage } = JSON.parse(fs.readFileSync(languagesConfigPath, 'utf-8'));

  if (builderConfig.i18n) {
    const { fallbacks, missing, noLocalization } = collectI18nSeoIssues(seoConfig.routes, languages, defaultLanguage);

    if (noLocalization.length > 0) {
      const lines = noLocalization
        .map(({ path, field }) => `  - route "${path}": "${field}"`)
        .join('\n');
      print.warn(
        `[generate-seo-html] i18n is enabled, but these routes have no language values in seo.json:\n${lines}\n\n` +
        `Add per-language objects (e.g. { "en": ..., "fr": ... }) under the matching route's ` +
        `"title"/"description" in config/seo.json to localize this content, or ignore this ` +
        `warning if sharing the same content across every language is intentional.`
      );
    }

    if (fallbacks.length > 0) {
      const lines = fallbacks
        .map(({ path, field, lang, sourceLang }) => `  - route "${path}": "${field}.${lang}" not set — using "${field}.${sourceLang}"`)
        .join('\n');
      print.error(`[generate-seo-html] Using defaultLanguage fallback for missing i18n content:\n${lines}`);
    }

    if (missing.length > 0) {
      const lines = missing
        .map(({ path, field, lang }) => `  - route "${path}": missing "${field}.${lang}" (no language has a value for this field)`)
        .join('\n');

      errorExit(
        `config/seo.json is missing required content:\n${lines}\n\n` +
        `Add these keys under the matching route's "title"/"description" in config/seo.json. ` +
        `Configured languages (config/languages.json): ${languages.join(', ')}.`
        , 'generate-seo-html'
      );
    }
  }

  try {
    const bundleUrl = await buildSsrBundle();
    await warnForRoutesMissingSeoConfig(bundleUrl, seoConfig.routes, defaultLanguage, baseUrl);

    for (const route of seoConfig.routes) {
      await processRoute(template, baseUrl, defaultLanguage, languages, route, bundleUrl);
    }
  } finally {
    cleanupSsrBundle();
  }
}
