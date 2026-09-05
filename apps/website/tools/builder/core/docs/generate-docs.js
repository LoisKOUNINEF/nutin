import * as fs from 'fs';
import * as path from 'path';
import { errorExit, runScript } from '../../../utils/index.js';
import { PATHS } from '../app/paths.js';

// The documentation compiler (scripts/generate-docs.mjs) is a standalone, repo-root
// script that turns `docs/**/*.md` into `apps/website/generated/docs.json` — it knows
// nothing about this app's build pipeline. This step just runs it, then copies its
// output into the served tree, the same way build-i18n.js does for combined locales.
const COMPILER_SCRIPT = path.resolve(process.cwd(), '..', '..', 'scripts', 'generate-docs.mjs');
const MANIFEST_SOURCE = path.resolve(process.cwd(), 'generated', 'docs.json');
const MANIFEST_DEST = path.join(PATHS.tempSource, 'generated', 'docs.json');

runScript(COMPILER_SCRIPT, 'Compiling docs/ into a manifest...');

try {
  fs.mkdirSync(path.dirname(MANIFEST_DEST), { recursive: true });
  fs.copyFileSync(MANIFEST_SOURCE, MANIFEST_DEST);
} catch (err) {
  errorExit(err, 'generate-docs');
}
