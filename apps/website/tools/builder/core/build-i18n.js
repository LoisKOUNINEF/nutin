import * as fs from 'fs';
import * as path from 'path';
import { exit } from 'process';
import { getFilesRecursive, print, isVerbose } from '../../utils/index.js';
import { PATHS } from './paths.js';

const destDir = path.join(PATHS.tempSource, 'locales');

function findLocaleFiles() {
  const allFiles = getFilesRecursive(PATHS.sourceApp, '.json');
  const localeFileMap = {};

  allFiles.forEach(file => {
    const fileName = path.basename(file);
    const locale = fileName.replace('.json', '');

    if (/^[a-z]{2}(-[A-Z]{2})?$/.test(locale)) {
      if (!localeFileMap[locale]) localeFileMap[locale] = [];
      localeFileMap[locale].push(file);
    }
  });

  return localeFileMap;
}

function getKeyForFile(filePath) {
  const parts = filePath.split(path.sep);

  const localesIndex = parts.lastIndexOf('locales');
  if (localesIndex > 0) {
    return parts[localesIndex - 1];
  } else {
    return path.basename(path.dirname(filePath)); // fallback
  }
}

function combineJsonFiles(files) {
  const combined = {};

  files.forEach(file => {
    const key = getKeyForFile(file);
    const content = JSON.parse(fs.readFileSync(file, 'utf8'));
    combined[key] = content;
  });

  return combined;
}

async function removeJsonFiles(directory) {
  try {
    await fs.promises.access(directory);
  } catch {
    print.info(`Directory ${directory} does not exist, skipping cleanup`);
    return;
  }
  
  const jsonFiles = getFilesRecursive(directory, '.json');
  
  for (const file of jsonFiles) {
    if (file.includes(`${path.sep}locales${path.sep}`)) {
      try {
        await fs.promises.unlink(file);
        if (isVerbose) print.info(`Deleted locale JSON file: ${file}`);
      } catch (err) {
        print.error(`Failed to remove ${file}: ${err.message}`);
      }
    } 
    else if (isVerbose) {
      print.info(`Skipping non-locale JSON file: ${file}`);
    }
  }

  await removeEmptyDirectories(directory);

  if (isVerbose) print.boldInfo(`JSON files cleanup complete.`);
}

async function removeEmptyDirectories(directory) {
  let items;
  try {
    items = await fs.promises.readdir(directory);
  } catch {
    return;
  }

  for (const item of items) {
    const fullPath = path.join(directory, item);
    let stat;
    try {
      stat = await fs.promises.stat(fullPath);
    } catch {
      continue;
    }

    if (stat.isDirectory()) {
      await removeEmptyDirectories(fullPath);
    }
  }

  if (directory !== PATHS.tempApp) {
    try {
      const updatedItems = await fs.promises.readdir(directory);
      if (updatedItems.length === 0) {
        await fs.promises.rmdir(directory, { recursive: false });
        if (isVerbose) print.info(`📁 Removed empty directory: ${directory}`);
      }
    } catch (err) {
      print.error(`Failed to remove empty directory ${directory}: ${err.message}`);
    }
  }
}

async function mergeJson() {
  if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });

  const localeFilesMap = findLocaleFiles();

  for (const [locale, files] of Object.entries(localeFilesMap)) {
    const combined = combineJsonFiles(files);
    fs.writeFileSync(
      `${destDir}/${locale}.json`,
      JSON.stringify(combined, null, 2)
    );
    if (isVerbose) print.boldInfo(`Json files for locale ${locale} merged successfully`);
  }
  removeJsonFiles(PATHS.tempApp);
}

mergeJson().catch((err) => {
  print.boldError(`Unexpected error: ${err.message}`);
  exit(1);
});
