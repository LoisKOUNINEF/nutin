import { readFile } from 'fs/promises';
import path from 'path';
import { print, errorExit } from '../../../utils/index.js';
import { PATHS } from '../app/paths.js';
import { addTags } from './add-tags.js';

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

  htmlContent = await addTags(htmlContent, filePath).catch(err => errorExit(err.message));

  if (!/<script[^>]*type=["']module["']/.test(htmlContent)) {
    errorExit('No module scripts found in HTML');
  }
  if (!/<link[^>]*rel=["']stylesheet["']/.test(htmlContent)) {
    errorExit('No stylesheet found in HTML');
  }
}

validateHtml().catch((err) => {
  errorExit(err, 'validate-html');
});
