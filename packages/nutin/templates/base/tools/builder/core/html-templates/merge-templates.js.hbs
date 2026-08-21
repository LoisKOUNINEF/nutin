import fs from 'fs/promises';
import path from 'path';
import { getFilesRecursive, print } from '../../../utils/index.js';
import { PATHS } from '../app/paths.js';
import { minifyHTML } from './minify-html.js';

const PLACEHOLDER = '__TEMPLATE_PLACEHOLDER__';
const TARGET_EXTENSIONS = ['.ts', '.js'];

export async function mergeMinifiedTemplates() {
  const htmlFiles = await getFilesRecursive(PATHS.tempApp, 'html');
  const failures = [];

  for (const htmlPath of htmlFiles) {
    const htmlFilename = path.basename(htmlPath);

    try {
      const htmlContent = await fs.readFile(htmlPath, 'utf-8');
      const minifiedHtml = await minifyHTML(htmlContent);
      const mergedInto = await mergeIntoSiblings(htmlPath, minifiedHtml, failures);

      if (mergedInto > 0) await fs.unlink(htmlPath);
      else failures.push(`${htmlFilename} (no matching .ts or .js found)`);
    } catch (err) {
      print.boldError(`ERROR: Failed to read ${htmlFilename}. ${err.message}`);
      failures.push(htmlFilename);
    }
  }

  const leftoverPlaceholders = await findLeftoverPlaceholders();
  failures.push(...leftoverPlaceholders);

  if (failures.length) {
    throw new Error(`Failed to merge ${failures.length} template(s): ${failures.join(', ')}`);
  }
}

// Normally a view/component has exactly one sibling here — `.js` in dev (tsc
// output), `.ts` in prod (esbuild bundles straight from source, tsc runs
// --noEmit there). Patching whichever exist(s) rather than assuming one,
// so this can't silently regress again if that dev/prod split ever changes.
async function mergeIntoSiblings(htmlPath, minifiedHtml, failures) {
  let mergedInto = 0;

  for (const extension of TARGET_EXTENSIONS) {
    const targetPath = htmlPath.replace(/\.html$/, extension);
    const targetFilename = path.basename(targetPath);

    let content;
    try {
      content = await fs.readFile(targetPath, 'utf-8');
    } catch (err) {
      if (err.code === 'ENOENT') continue;
      print.boldError(`ERROR: Cannot update ${targetFilename}. ${err.message}`);
      failures.push(targetFilename);
      continue;
    }

    if (!content.includes(PLACEHOLDER)) {
      print.boldError(`ERROR: No matching placeholder in ${targetFilename}. Make sure the template const is \`${PLACEHOLDER}\`.`);
      failures.push(targetFilename);
      continue;
    }

    await fs.writeFile(targetPath, content.replace(PLACEHOLDER, minifiedHtml));
    mergedInto++;
  }

  return mergedInto;
}

async function findLeftoverPlaceholders() {
  const files = await getFilesRecursive(PATHS.tempApp, TARGET_EXTENSIONS);
  const leftovers = [];

  for (const file of files) {
    const content = await fs.readFile(file, 'utf-8');
    if (content.includes(PLACEHOLDER)) leftovers.push(`${path.basename(file)} (no matching .html found)`);
  }

  return leftovers;
}
