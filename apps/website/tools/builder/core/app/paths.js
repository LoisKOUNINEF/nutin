import path from 'path';

const SRC_FOLDERNAME = 'src';
const APP_FOLDERNAME = 'app';
const TMP_FOLDERNAME = 'dist-build';
const BLD_FOLDERNAME = 'dist';

const BASE_PATHS = {
  source: path.resolve(SRC_FOLDERNAME),
  temp: path.resolve(TMP_FOLDERNAME),
  build: path.resolve(BLD_FOLDERNAME)
};

export const PATHS = {
  ...BASE_PATHS,
  sourceApp: path.join(BASE_PATHS.source, APP_FOLDERNAME),
  tempSource: path.join(BASE_PATHS.temp, SRC_FOLDERNAME),
  tempApp: path.join(BASE_PATHS.temp, SRC_FOLDERNAME, APP_FOLDERNAME),
};

// Copied sources that only feed the bundles — finalize-build.js removes them in prod,
// so hashing/compressing them is wasted work (and renaming them breaks the SSR bundle).
const BUNDLED_SOURCE_DIRS = [PATHS.tempApp, path.join(PATHS.tempSource, 'core')];

export function isBundledSource(file) {
  return BUNDLED_SOURCE_DIRS.some((dir) => file.startsWith(dir + path.sep));
}
