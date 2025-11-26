import esbuild from 'esbuild';
import path from 'path';
import { exit } from 'process';
import { print, isVerbose } from '../../utils/index.js';
import { PATHS } from './paths.js';
import builderConfig from '../../../builder.config.js';

const ENTRY_FILE = path.join(PATHS.tempApp, 'main.ts');
const OUT_FILE = path.join(PATHS.tempSource, 'bundle.js');

async function build() {
  await esbuild.build({
    ...builderConfig.esbuild,
    entryPoints: [ENTRY_FILE],
    outfile: OUT_FILE,
    keepNames: true, // View names are used to update meta.title
  });

  if (isVerbose) print.boldInfo(`ESBuild complete.\n`);
}

build().catch((err) => {
  print.boldError(`ESBuild failed: ${err.message}`);
  exit(1);
});
