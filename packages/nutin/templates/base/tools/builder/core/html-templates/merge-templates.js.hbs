import fs from 'fs/promises';
import path from 'path';
import { getFilesRecursive, print, pascalCased, capitalized } from '../../../utils/index.js';
import { PATHS } from '../app/paths.js';
import { minifyHTML } from './minify-html.js';

const PLACEHOLDER = '__TEMPLATE_PLACEHOLDER__';
const TARGET_EXTENSIONS = ['.ts', '.js'];
const TEMPLATE_REGEX = /const\s+(?:template|templateFn)\s*=?\s*(?:\(.*?\)\s*=>\s*)?`([\s\S]*?)`/;

// A component/view's template can live inline in its .ts/.js file or in a
// colocated .html sibling merged in via `__TEMPLATE_PLACEHOLDER__` — resolved
// automatically per file rather than through a global config flag:
//   external + placeholder -> merge external in
//   external + real inline markup -> conflict, fail
//   no external + real inline markup -> minify inline
//   no external + still the placeholder -> nothing to use, fail
export async function resolveTemplates() {
  const htmlFiles = await getFilesRecursive(PATHS.tempApp, 'html');
  const resolvedPaths = new Set();
  const failures = [];

  for (const htmlPath of htmlFiles) {
    await resolveExternalTemplate(htmlPath, resolvedPaths, failures);
  }

  await resolveRemainingTemplates(resolvedPaths, failures);

  if (failures.length) {
    throw new Error(`Failed to resolve ${failures.length} template(s).`);
  }
}

// Normally a view/component has exactly one sibling here — `.js` in dev (tsc
// output), `.ts` in prod (esbuild bundles straight from source, tsc runs
// --noEmit there). Checking whichever exist(s) rather than assuming one, so
// this can't silently regress again if that dev/prod split ever changes.
async function resolveExternalTemplate(htmlPath, resolvedPaths, failures) {
  const htmlFilename = path.basename(htmlPath);

  let htmlContent;
  try {
    htmlContent = await fs.readFile(htmlPath, 'utf-8');
  } catch (err) {
    print.warn(`Failed to read "${htmlFilename}". ${err.message}`);
    failures.push(htmlFilename);
    return;
  }

  const minifiedHtml = await minifyHTML(htmlContent);
  let mergedCount = 0;
  let conflictCount = 0;

  for (const extension of TARGET_EXTENSIONS) {
    const codePath = htmlPath.replace(/\.html$/, extension);

    let content;
    try {
      content = await fs.readFile(codePath, 'utf-8');
    } catch (err) {
      if (err.code === 'ENOENT') continue;
      print.warn(`Cannot update "${path.basename(codePath)}". ${err.message}`);
      failures.push(path.basename(codePath));
      resolvedPaths.add(codePath);
      continue;
    }

    resolvedPaths.add(codePath);

    if (content.includes(PLACEHOLDER)) {
      await fs.writeFile(codePath, content.replace(PLACEHOLDER, minifiedHtml));
      mergedCount++;
      continue;
    }

    print.warn(describeConflict(codePath));
    failures.push(path.basename(codePath));
    conflictCount++;
  }

  if (mergedCount > 0) {
    await fs.unlink(htmlPath);
  } else if (mergedCount + conflictCount === 0) {
    print.warn(describeOrphanHtml(htmlPath));
    failures.push(htmlFilename);
  }
}

async function resolveRemainingTemplates(resolvedPaths, failures) {
  const codeFiles = await getFilesRecursive(PATHS.tempApp, TARGET_EXTENSIONS);

  for (const codePath of codeFiles) {
    if (resolvedPaths.has(codePath)) continue;

    const content = await fs.readFile(codePath, 'utf-8');
    const match = content.match(TEMPLATE_REGEX);
    if (!match) continue;

    const [full, body] = match;

    if (body === PLACEHOLDER) {
      print.warn(describeMissingTemplate(codePath));
      failures.push(path.basename(codePath));
      continue;
    }

    const minified = await minifyHTML(body);
    await fs.writeFile(codePath, content.replace(full, full.replace(body, minified)));
  }
}

function describeCodeFile(codePath) {
  const filename = path.basename(codePath);
  const basename = filename.replace(/\.(ts|js)$/, '');
  const lastDot = basename.lastIndexOf('.');
  const namePart = lastDot === -1 ? basename : basename.slice(0, lastDot);
  const suffix = lastDot === -1 ? '' : basename.slice(lastDot + 1);
  const kind = suffix ? capitalized(suffix) : 'Component';
  const className = `${pascalCased(namePart)}${kind}`;

  return { filename, basename, kind, className };
}

function describeConflict(codePath) {
  const { filename, basename, kind, className } = describeCodeFile(codePath);

  return `${kind} "${className}" has both an inline template and an external template.

Use either:
  ${filename}
or:
  ${filename} (template placeholder) + ${basename}.html
Remove one of the template definitions.`;
}

function describeMissingTemplate(codePath) {
  const { filename, basename, kind, className } = describeCodeFile(codePath);

  return `${kind} "${className}" has a template placeholder but no external template.

Expected:
  ${filename} (template placeholder) + ${basename}.html
Add ${basename}.html, or replace the placeholder in ${filename} with inline markup.`;
}

function describeOrphanHtml(htmlPath) {
  const htmlFilename = path.basename(htmlPath);
  const basename = htmlFilename.replace(/\.html$/, '');

  return `"${htmlFilename}" has no matching component or view (expected ${basename}.ts or ${basename}.js).
Remove ${htmlFilename}, or add ${basename}.ts with a template placeholder to merge it into.`;
}
