import esbuild from 'esbuild';
import path from 'path';
import { exit } from 'process';
import { print } from '../../utils/index.js';
import { PATHS } from './paths.js';

const ENTRY_FILE = path.join(PATHS.tempApp, 'main.ts');
const OUT_FILE = path.join(PATHS.tempSource, 'bundle.js');

async function build() {
  await esbuild.build({
    entryPoints: [ENTRY_FILE],
    outfile: OUT_FILE,
    bundle: true,
    minify: true,
    keepNames: true, // View names are used to update meta.title
    sourcemap: false,
    platform: 'browser',
    format: 'esm',
    target: ['es2015'],
    legalComments: 'none',
    loader: {
      '.json': 'json',
    },
    define: {
      'process.env.NODE_ENV': '"production"',
    },
  });

  print.info(`ESBuild complete.`);
}


build().catch((err) => {
  print.boldError(`ESBuild failed: ${err.message}`);
  exit(1);
});
