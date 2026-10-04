import fs from 'fs';
import path from 'path';
import { PATHS } from '../app/paths.js';
import { print, errorExit } from '../../../utils/index.js';
import { buildSsrBundle, cleanupSsrBundle } from './ssr/ssr-bundle.js';
import { renderRoute } from './ssr/ssr-render.js';
import { builderConfig } from '../../builder.config.js';
import { resolveLocaleValue, valueForLangWithFallback, collectI18nSeoIssues } from './i18n-resolution.js';
import { segmentsOf, routeSuffixOf, validateMockParams, writeRouteHtml, warnForRoutesMissingSeoConfig } from './route-output.js';
import { resolveSeoRoutes, resolveSeoOptOutPaths } from './seo-routes.js';

// og:image/twitter:image require an absolute URL for social platforms to resolve them;
// every other absolute field (og:url, canonical) is already baseUrl-prefixed, so ogImage
// (a repo-relative path in config/seo.json) needs the same treatment.
function toAbsoluteUrl(urlOrPath, baseUrl) {
  if (!urlOrPath) return urlOrPath;
  return /^https?:\/\//.test(urlOrPath) ? urlOrPath : `${baseUrl}${urlOrPath}`;
}

// Returns the guard result when a route guard refused the route (nothing written), else null.
async function processRoute(template, baseUrl, defaultLanguage, languages, route, bundleUrl) {
  validateMockParams(route);

  const routeSuffix = routeSuffixOf(route);

  if (builderConfig.i18n) {
    // Same for every language variant of this route — lets crawlers know these URLs
    // are alternates of one page rather than duplicate/competing content. x-default
    // points at the default language.
    const hreflangLinks = [
      ...languages.map((l) => ({ hreflang: l, href: `${baseUrl}/${l}${routeSuffix}/` })),
      { hreflang: 'x-default', href: `${baseUrl}/${defaultLanguage}${routeSuffix}/` },
    ];

    // Every language is rendered before anything is written: a guard refusing any of
    // them skips the whole route, rather than shipping some language variants.
    const pages = [];
    for (const lang of languages) {
      const pageUrl = `${baseUrl}/${lang}${routeSuffix}`;
      const result = await renderRoute({
        bundleUrl,
        appRoutesKey: route.path,
        mockParams: route.mockParams,
        mockFetch: route.mockFetch,
        lang,
        pageUrl,
        i18nEnabled: builderConfig.i18n,
      });
      if (result.blocked) return result;
      pages.push({ lang, pageUrl, body: result.html, navbar: result.navbar, footer: result.footer });
    }

    for (const { lang, pageUrl, body, navbar, footer } of pages) {
      const title = valueForLangWithFallback(route.title, lang, defaultLanguage);
      const description = valueForLangWithFallback(route.description, lang, defaultLanguage);
      const ogImage = toAbsoluteUrl(valueForLangWithFallback(route.ogImage, lang, defaultLanguage), baseUrl);

      await writeRouteHtml({
        template, lang, title, description, pageUrl, ogImage, body, navbar, footer, hreflangLinks,
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
    const result = await renderRoute({
      bundleUrl,
      appRoutesKey: route.path,
      mockParams: route.mockParams,
      mockFetch: route.mockFetch,
      lang: defaultLanguage,
      pageUrl,
      i18nEnabled: builderConfig.i18n,
    });
    if (result.blocked) return result;

    await writeRouteHtml({
      template, lang: defaultLanguage, title, description, pageUrl, ogImage, body: result.html,
      navbar: result.navbar, footer: result.footer,
      outputSegments: segmentsOf(routeSuffix),
      routePath: route.path,
    });
  }

  return null;
}

function describeBlocked(route, { redirectTo }) {
  const outcome = redirectTo ? `redirected an anonymous visitor to "${redirectTo}"` : 'blocked an anonymous visitor';
  const url = routeSuffixOf(route) || '/';
  const where = url === route.path ? `"${route.path}"` : `"${route.path}" (${url})`;
  return `[generate-seo-html] Route ${where} was not prerendered: its guard ${outcome}. ` +
    `It is left out of sitemap.xml too.`;
}

export async function generateSeoHtml() {
  const templatePath = path.join(PATHS.tempSource, 'index.html');
  const template = fs.readFileSync(templatePath, 'utf-8');

  if (!template.includes('</head>')) {
    errorExit('index.html is missing a </head> tag — cannot inject SEO tags', 'generate-seo-html');
  }

  const seoConfigPath = path.join(PATHS.temp, 'config', 'seo.json');
  const seoConfig = JSON.parse(fs.readFileSync(seoConfigPath, 'utf-8'));
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

  // routeSuffixOf() of every route a guard refused, so the sitemap can leave them out too.
  const skippedSuffixes = new Set();

  try {
    const bundleUrl = await buildSsrBundle();
    // seo.json routes plus feature-generated ones (e.g. one per Markdown page).
    const routes = resolveSeoRoutes(seoConfig);
    await warnForRoutesMissingSeoConfig(bundleUrl, routes, defaultLanguage, baseUrl, resolveSeoOptOutPaths());

    for (const route of routes) {
      const blocked = await processRoute(template, baseUrl, defaultLanguage, languages, route, bundleUrl);
      if (!blocked) continue;
      print.warn(describeBlocked(route, blocked));
      skippedSuffixes.add(routeSuffixOf(route));
    }
  } finally {
    cleanupSsrBundle();
  }

  return skippedSuffixes;
}
