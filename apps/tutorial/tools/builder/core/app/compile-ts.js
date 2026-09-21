import { runCommand, print, errorExit } from "../../../utils/index.js";
import { builderConfig } from '../../builder.config.js';

async function compileTS() {
  // Prod bundles straight from .ts source (see prod-bundle/esbuild.js), so tsc only
  // needs to type-check there, not emit — emitting would leave a stale, unmerged .js
  // sibling next to each merged .ts view/component's source.
  const args = ['--project', 'tsconfig.json'];
  if (builderConfig.isProd) args.push('--noEmit');

  await runCommand('tsc', args);
}

compileTS().catch((err) => {
  errorExit(err, 'compile-ts');
});
