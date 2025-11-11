import { readFile, writeFile } from 'fs/promises';
import { JSDOM } from 'jsdom';
import { exit } from 'process';
import { print, isProd } from '../../utils/index.js';
import { PATHS } from './paths.js';
import path from 'path';

function errorExit(message) {
  print.boldError(`[ERROR] ${message}`);
  exit(1);
}

async function addEntrypoint(htmlContent, filePath) {
  print.info('Adding script in HTML...');

  const dom = new JSDOM(htmlContent);
  const document = dom.window.document;

  const newScript = document.createElement("script");
  newScript.type = "module";
  newScript.src = isProd ? "/bundle.js" : "/app/main.js";

  document.body.appendChild(newScript);
  const serialized = dom.serialize().replace(/>\s+</g, '><')

  writeFile(filePath, serialized, "utf8");

  return htmlContent;
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

  await addEntrypoint(htmlContent, filePath);

  print.info('HTML validation passed');
}

validateHtml();
