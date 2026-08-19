import esbuild from 'esbuild';
import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';
import { PATHS } from '../../paths.js';
import { builderConfig } from '../../../builder.config.js';

const SSR_DIR = path.join(PATHS.temp, '.ssr');
const ENTRY_FILE = path.join(PATHS.tempApp, '__ssr-entry.ts');
const OUT_FILE = path.join(SSR_DIR, 'ssr-bundle.mjs');

const ENTRY_CONTENT = `export { appRoutes } from './routes.js';
export { I18nService, Service, registerPipes } from '../core/index.js';
export { RouteGuardsManager } from '../core/services/router/helpers/route-guard-manager.helper.js';
`;

/**
 * Bundles a synthetic entry (re-exporting appRoutes + I18nService/Service) targeting Node,
 * so generate-seo-html.js can import it and render real Views in a linkedom environment.
 * Written outside dist-build/src so hash-files.js/compress-files.js never see it.
 */
export async function buildSsrBundle() {
  fs.mkdirSync(SSR_DIR, { recursive: true });
  fs.writeFileSync(ENTRY_FILE, ENTRY_CONTENT, 'utf-8');

  try {
    await esbuild.build({
      ...builderConfig.esbuild,
      platform: 'node',
      format: 'esm',
      target: ['node22'],
      minify: false,
      drop: [],
      legalComments: 'none',
      loader: {
        '.json': 'json',
      },
      define: {
        'process.env.NODE_ENV': '"production"',
      },
      entryPoints: [ENTRY_FILE],
      outfile: OUT_FILE,
      keepNames: true,
    });
  } finally {
    fs.rmSync(ENTRY_FILE, { force: true });
  }

  return pathToFileURL(OUT_FILE).href;
}

export function cleanupSsrBundle() {
  fs.rmSync(SSR_DIR, { recursive: true, force: true });
}
