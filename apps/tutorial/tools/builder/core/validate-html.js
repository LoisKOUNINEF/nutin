import { readFile, writeFile } from 'fs/promises';
import { exit } from 'process';
import { print, isProd, isVerbose } from '../../utils/index.js';
import { PATHS } from './paths.js';
import path from 'path';

function errorExit(message) {
  print.boldError(`[ERROR] ${message}`);
  exit(1);
}

async function addEntrypoint(htmlContent, filePath) {
  if (isVerbose) print.info('Adding script in HTML...');

  const scriptSrc = isProd ? "bundle.js" : "app/main.js";
  const scriptTag = `<script type="module" src="/${scriptSrc}"></script>`;

  let modifiedHtml;
  if (/<\/body>/i.test(htmlContent)) {
    modifiedHtml = htmlContent.replace(/<\/body>/i, `${scriptTag}</body>`);
  } else {
    modifiedHtml = htmlContent + scriptTag;
  }

  const minified = modifiedHtml.replace(/>\s+</g, '><');

  writeFile(filePath, minified, "utf8");

  return modifiedHtml;
}

async function validateHtml() {
  const filePath = path.join(PATHS.tempSource, 'index.html');

  let htmlContent;
  try {
    htmlContent = await readFile(filePath, 'utf-8');
  } catch {
    errorExit(`Failed to read ${filePath}`);
  }

  if (!htmlContent.includes('id="app"')) {
    errorExit('Missing #app container in HTML');
  }

  if (!/<link[^>]*rel=["']stylesheet["']/.test(htmlContent)) {
    errorExit('No stylesheet found in HTML');
  }

  htmlContent = await addEntrypoint(htmlContent, filePath).catch(err => errorExit(err.message));

  if (!/<script[^>]*type=["']module["']/.test(htmlContent)) {
    errorExit('No module scripts found in HTML');
  }

  if (isVerbose) print.boldInfo('HTML validation passed\n');
}

validateHtml();
