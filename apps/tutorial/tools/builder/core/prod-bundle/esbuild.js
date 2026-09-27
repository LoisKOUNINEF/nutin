import esbuild from 'esbuild';
import path from 'path';
import { print, errorExit } from '../../../utils/index.js';
import { PATHS } from '../app/paths.js';
import { builderConfig } from '../../builder.config.js';

// Prod bundles straight from the copied .ts sources (tsc runs --noEmit there);
// dev bundles tsc's emitted .js, which is kept on disk for testin-nutin.
const ENTRY_FILE = path.join(PATHS.tempApp, builderConfig.isProd ? 'main.ts' : 'main.js');
const OUT_FILE = path.join(PATHS.tempSource, 'bundle.js');

const DEV_OVERRIDES = {
  minify: false,
  sourcemap: true,
  drop: [],
};

async function build() {
  await esbuild.build({
    ...builderConfig.esbuild,
    ...(builderConfig.isProd ? {} : DEV_OVERRIDES),
    platform: 'browser',
    format: 'esm',
    legalComments: 'none',
    loader: {
      '.json': 'json',
    },
    define: {
      'process.env.NODE_ENV': builderConfig.isProd ? '"production"' : '"development"',
    },
    entryPoints: [ENTRY_FILE],
    outfile: OUT_FILE,
    keepNames: false,
  });
}

build().catch((err) => {
  errorExit(err, 'esbuild');
});
