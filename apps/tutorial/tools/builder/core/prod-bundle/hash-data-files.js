import fs from 'fs';
import { PATHS } from '../app/paths.js';
import { errorExit } from '../../../utils/index.js';
import { hashDataFiles, DATA_FILES_MAP } from './data-files.js';

// Prod only, before esbuild.js: the bundles get the map through their define (bundle-options.js).
try {
  fs.writeFileSync(DATA_FILES_MAP, JSON.stringify(hashDataFiles(PATHS.tempSource)));
} catch (err) {
  errorExit(err, 'hash-data-files');
}
