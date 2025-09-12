import fs from 'fs/promises';
import path from 'path';
import { exit } from 'process';
import { print } from '../../utils/index.js';

const JS_DIR = 'dist-build/src/app';
const PLACEHOLDER = '__TEMPLATE_PLACEHOLDER__';

async function findHtmlFiles(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        return findHtmlFiles(fullPath);
      } else if (entry.isFile() && fullPath.endsWith('.html')) {
        return [fullPath];
      }
      return [];
    })
  );
  return files.flat();
}

async function mergeTemplates() {
  const htmlFiles = await findHtmlFiles(JS_DIR);

  for (const htmlPath of htmlFiles) {
    const jsPath = htmlPath.replace(/\.html$/, '.js');
    const htmlFilename = path.basename(htmlPath);
    const jsFilename = path.basename(jsPath);

    try {
      const htmlContent = await fs.readFile(htmlPath, 'utf-8');
      const minified = htmlContent.replace(/\n/g, '');
      const escaped = minified.replace(/([\\/&`"])/g, '\\$1');

      try {
        let jsContent = await fs.readFile(jsPath, 'utf-8');
        if (!jsContent.includes(PLACEHOLDER)) {
          print.boldError(`WARNING: No matching placeholder in ${jsFilename}`);
          print.error(`If you're using external templates, make sure the template const is \`${PLACEHOLDER}\`.`);
          print.error(`If using inline templates, remove ${htmlFilename}.`);
          exit(1);
        }

        jsContent = jsContent.replace(PLACEHOLDER, escaped);
        await fs.writeFile(jsPath, jsContent);
        print.info(`✅ Updated ${jsFilename} with template from ${htmlFilename}.`);
      } catch (err) {
        print.boldError(`ERROR: Cannot update ${jsFilename}. ${err.message}`);
      }
    } catch (err) {
      print.boldError(`ERROR: Failed to read ${htmlFilename}. ${err.message}`);
    }
  }
}

mergeTemplates().catch((err) => {
  print.boldError(`Unexpected error: ${err.message}`);
  exit(1);
});
