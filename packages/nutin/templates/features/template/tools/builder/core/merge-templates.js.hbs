import fs from 'fs/promises';
import path from 'path';
import { exit } from 'process';
import { getFilesRecursive, print, isVerbose, isProd } from '../../utils/index.js';
import { minifyHTML } from './minify-html.js';
import { PATHS } from './paths.js';

const PLACEHOLDER = '__TEMPLATE_PLACEHOLDER__';

async function mergeTemplates() {
  const htmlFiles = await getFilesRecursive(PATHS.tempApp, 'html');
  const fileExtension = isProd ? '.ts' : '.js';

  for (const htmlPath of htmlFiles) {
    const jsPath = htmlPath.replace(/\.html$/, fileExtension);
    const htmlFilename = path.basename(htmlPath);
    const jsFilename = path.basename(jsPath);

    try {
      const htmlContent = await fs.readFile(htmlPath, 'utf-8');
      const minifiedHtml = await minifyHTML(htmlContent);
      if (isVerbose) print.info(`Minified HTML: ${htmlPath}`);

      try {
        let jsContent = await fs.readFile(jsPath, 'utf-8');
        if (!jsContent.includes(PLACEHOLDER)) {
          print.boldError(`WARNING: No matching placeholder in ${jsFilename}`);
          print.error(`Make sure the template const is \`${PLACEHOLDER}\`.`);
          exit(1);
        }

        jsContent = jsContent.replace(PLACEHOLDER, minifiedHtml);
        await fs.writeFile(jsPath, jsContent);
        await fs.unlink(htmlPath);
        if (isVerbose) print.info(`Updated ${jsFilename} with template from ${htmlFilename}.`);
      } catch (err) {
        print.boldError(`ERROR: Cannot update ${jsFilename}. ${err.message}`);
      }
    } catch (err) {
      print.boldError(`ERROR: Failed to read ${htmlFilename}. ${err.message}`);
    }
  }
  if (isVerbose) print.info(`HTML templates minified and merged in scripts.\n`)
}

mergeTemplates().catch((err) => {
  print.boldError(`Unexpected error: ${err.message}`);
  exit(1);
});
