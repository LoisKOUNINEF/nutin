import esbuild from 'esbuild';
import path from 'path';
import { errorExit } from '../../../utils/index.js';
import { PATHS } from '../app/paths.js';
import { builderConfig } from '../../builder.config.js';
import { sharedDefine, slimConfigPlugin } from './bundle-options.js';

// Prod bundles straight from the copied .ts sources (tsc runs --noEmit there);
// dev bundles tsc's emitted .js, which is kept on disk for testin-nutin.
const ENTRY_FILE = path.join(PATHS.tempApp, builderConfig.isProd ? 'main.ts' : 'main.js');

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
    define: sharedDefine(builderConfig),
    plugins: [slimConfigPlugin({ generateSEO: builderConfig.generateSEO })],
    // Code splitting: each dynamic import() becomes a chunk in chunks/, only fetched
    // the first time it runs. The entry still comes out as bundle.js (see add-tags.js).
    splitting: true,
    entryPoints: [{ in: ENTRY_FILE, out: 'bundle' }],
    outdir: PATHS.tempSource,
    chunkNames: `${path.basename(PATHS.tempChunks)}/[name]-[hash]`,
    keepNames: false,
  });
}

build().catch((err) => {
  errorExit(err, 'esbuild');
});
