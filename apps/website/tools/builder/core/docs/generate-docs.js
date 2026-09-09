import * as fs from 'fs';
import * as path from 'path';
import { errorExit, runScript } from '../../../utils/index.js';
import { PATHS } from '../app/paths.js';

// The documentation compiler (scripts/generate-docs.mjs) is a standalone, repo-root
// script that turns `resources/<collection>/**/*.md` into one manifest per collection
// under `apps/website/generated/` — it knows nothing about this app's build pipeline.
// This step just runs it, then copies its outputs into the served tree, the same way
// build-i18n.js does for combined locales.
const COMPILER_SCRIPT = path.resolve(process.cwd(), '..', '..', 'scripts', 'generate-docs.mjs');
const MANIFEST_SOURCE_DIR = path.resolve(process.cwd(), 'generated');
const MANIFEST_DEST_DIR = path.join(PATHS.tempSource, 'generated');
const MANIFESTS = ['docs.json', 'changelog.json', 'tutorial.json', 'articles.json'];

runScript(COMPILER_SCRIPT, 'Compiling resources/ into manifests...');

try {
  fs.mkdirSync(MANIFEST_DEST_DIR, { recursive: true });
  for (const manifest of MANIFESTS) {
    fs.copyFileSync(path.join(MANIFEST_SOURCE_DIR, manifest), path.join(MANIFEST_DEST_DIR, manifest));
  }
} catch (err) {
  errorExit(err, 'generate-docs');
}
