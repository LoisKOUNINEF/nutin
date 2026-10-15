import fs from 'fs';
import path from 'path';
import { PATHS } from '../app/paths.js';
import { builderConfig } from '../../builder.config.js';

// The URL path(s) a route's Disallow lines must cover: `:param` segments become `*` (every
// value of that segment), and with i18n on the pages live under each /<lang>/ prefix.
function disallowPathsFor(route, { i18n, languages }) {
  const pattern = route.path.replace(/:[^/]+/g, '*');
  if (!i18n) return [pattern];
  const suffix = pattern === '/' ? '/' : pattern;
  return languages.map((lang) => `/${lang}${suffix}`);
}

export function buildRobotsTxt(seoConfig, { i18n = false, languages = [] } = {}) {
  const i18nOptions = { i18n, languages };
  const baseUrl = seoConfig.baseUrl.replace(/\/$/, '');
  const routes = seoConfig.routes ?? [];
  const disallowBots = new Set(seoConfig.disallowBots ?? []);

  // Paths disallowed for all bots (disallow: true)
  const globalDisallows = routes
    .filter(r => r.disallow === true)
    .flatMap(r => disallowPathsFor(r, i18nOptions));

  // Paths disallowed per named bot: { botName -> [path, ...] }
  const perBotDisallows = {};
  for (const r of routes) {
    if (!Array.isArray(r.disallow)) continue;
    for (const bot of r.disallow) {
      (perBotDisallows[bot] ??= []).push(...disallowPathsFor(r, i18nOptions));
    }
  }
  for (const bot of disallowBots) {
    perBotDisallows[bot] ??= [];
  }

  const lines = [
    'User-agent: *',
    'Allow: /',
    ...globalDisallows.map(p => `Disallow: ${p}`),
  ];

  for (const [bot, paths] of Object.entries(perBotDisallows)) {
    lines.push('');
    lines.push(`User-agent: ${bot}`);
    if (disallowBots.has(bot)) {
      // Fully blocked — per-route entries for this bot are redundant.
      lines.push('Disallow: /');
      continue;
    }
    // A bot with its own group ignores the `*` group entirely, so it has to
    // repeat the global disallows to stay blocked from them.
    for (const p of new Set([...globalDisallows, ...paths])) lines.push(`Disallow: ${p}`);
  }

  lines.push('', `Sitemap: ${baseUrl}/sitemap.xml`);
  return lines.join('\n') + '\n';
}

export function generateRobotsTxt() {
  const seoConfigPath = path.join(PATHS.temp, 'config', 'seo.json');
  const seoConfig = JSON.parse(fs.readFileSync(seoConfigPath, 'utf-8'));
  const languagesConfigPath = path.join(PATHS.temp, 'config', 'languages.json');
  const { languages } = JSON.parse(fs.readFileSync(languagesConfigPath, 'utf-8'));

  const outputPath = path.join(PATHS.tempSource, 'robots.txt');
  fs.writeFileSync(outputPath, buildRobotsTxt(seoConfig, { i18n: builderConfig.i18n, languages }), 'utf-8');
}
