import fs from 'fs';
import path from 'path';
import { PATHS } from '../app/paths.js';
import { hashFile } from './content-hash.js';

// The JSON files the app fetches at runtime, by the folder they're served from: the combined
// translations (i18n/build-i18n.js) and the markdown manifests (markdown/generate-markdown-pages.js).
export const DATA_DIRS = ['locales', 'generated'];

// Outside dist-build/src: read by the bundles' define, never served.
export const DATA_FILES_MAP = path.join(PATHS.temp, 'data-files.json');

const HASHED_NAME = /\.[0-9a-f]{8}\.json$/;

/**
 * Writes a "<name>.<hash>.json" copy of each JSON file in srcDir's DATA_DIRS and returns
 * their URLs, plain → hashed. The app fetches the hashed URL (see core's dataFileUrl), which
 * nginx caches as immutable: a changed file gets a new URL, an unchanged one keeps its own.
 * The plain file stays, for anything else that links to it (nginx revalidates it on each use).
 */
export function hashDataFiles(srcDir, dirs = DATA_DIRS) {
  const map = {};

  for (const dir of dirs) {
    const fullDir = path.join(srcDir, dir);
    if (!fs.existsSync(fullDir)) continue;

    for (const name of fs.readdirSync(fullDir).sort()) {
      const fullPath = path.join(fullDir, name);
      if (path.extname(name) !== '.json' || HASHED_NAME.test(name) || !fs.statSync(fullPath).isFile()) continue;

      const hashedName = `${path.basename(name, '.json')}.${hashFile(fullPath)}.json`;
      fs.copyFileSync(fullPath, path.join(fullDir, hashedName));
      map[`/${dir}/${name}`] = `/${dir}/${hashedName}`;
    }
  }

  return map;
}

// The map hash-data-files.js wrote, or {} when it didn't run (dev builds).
export function readDataFilesMap(mapFile = DATA_FILES_MAP) {
  try {
    return JSON.parse(fs.readFileSync(mapFile, 'utf-8'));
  } catch {
    return {};
  }
}
