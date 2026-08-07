import fs from 'fs';
import path from 'path';
import { exit } from 'process';
import { PATHS } from './paths.js';
import { print, isVerbose } from '../../utils/index.js';

function generateRobotsTxt() {
  const seoConfigPath = path.join(PATHS.temp, 'config', 'seo.json');
  const seoConfig = JSON.parse(fs.readFileSync(seoConfigPath, 'utf-8'));
  const baseUrl = seoConfig.baseUrl.replace(/\/$/, '');
  const routes = seoConfig.routes ?? [];
  const disallowBots = seoConfig.disallowBots ?? [];

  // Paths disallowed for all bots (disallow: true)
  const globalDisallows = routes
    .filter(r => r.disallow === true)
    .map(r => `Disallow: ${r.path}`);

  // Paths disallowed per named bot: { botName -> [path, ...] }
  const perBotDisallows = {};
  for (const r of routes) {
    if (!Array.isArray(r.disallow)) continue;
    for (const bot of r.disallow) {
      (perBotDisallows[bot] ??= []).push(r.path);
    }
  }
  // Bots that are fully blocked contribute an empty-path disallow
  for (const bot of disallowBots) {
    perBotDisallows[bot] ??= [];
  }

  const lines = [
    'User-agent: *',
    'Allow: /',
    ...globalDisallows,
  ];

  for (const [bot, paths] of Object.entries(perBotDisallows)) {
    lines.push('');
    lines.push(`User-agent: ${bot}`);
    if (paths.length > 0) {
      for (const p of paths) lines.push(`Disallow: ${p}`);
    } else {
      lines.push('Disallow: /');
    }
  }

  lines.push('', `Sitemap: ${baseUrl}/sitemap.xml`);

  const outputPath = path.join(PATHS.tempSource, 'robots.txt');
  fs.writeFileSync(outputPath, lines.join('\n') + '\n', 'utf-8');

  if (isVerbose) print.gray(`Generated: ${path.relative(process.cwd(), outputPath)}`);
}

try {
  generateRobotsTxt();
  if (isVerbose) print.boldInfo('✅ robots.txt generation complete.');
} catch (err) {
  print.boldError(`[generate-robots-txt] Unexpected error: ${err.message}`);
  exit(1);
}
