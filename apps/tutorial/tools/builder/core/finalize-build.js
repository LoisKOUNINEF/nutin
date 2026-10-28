import fs from 'fs';
import path from 'path';
import { PATHS } from "./app/paths.js";
import { builderConfig } from '../builder.config.js';
import { print, errorExit } from "../../utils/index.js";

function finalizeBuild() {
  removeBuildFiles();
  if (builderConfig.isProd) removeFoldersAfterBundle();
  if (builderConfig.isProd) removeNutinConfig();
  writeBuildStamp();
  replaceDir(PATHS.temp, PATHS.build);
}

// dist/.build-time: testin-nutin warns when sources changed after it (see stale-build.js).
// Outside dist/src, so it's never served.
function writeBuildStamp() {
  fs.writeFileSync(path.join(PATHS.temp, '.build-time'), `${new Date().toISOString()}\n`);
}

// Only used during the build: compile-ts's tsconfig and merge-templates' template map.
function removeBuildFiles() {
  ['tsconfig.json', '.template-map.json'].forEach((file) => fs.rmSync(path.join(PATHS.temp, file), { force: true }));
}

function removeFoldersAfterBundle() {
  const foldersToRemove = [ 'core', 'app', path.join('..', 'config') ];
  const pathToFolder = (folder) => path.join(PATHS.tempSource, folder);

  foldersToRemove.forEach(folder => fs.rmSync(pathToFolder(folder), { recursive: true, force: true }));
}

function removeNutinConfig() {
  fs.rmSync(path.join(PATHS.temp, 'nutin.config.js'));
}

function replaceDir(src, dest) {
  fs.rmSync(dest, { recursive: true, force: true });
  fs.renameSync(src, dest);
}

try {
  finalizeBuild();
} catch(err) {
  errorExit(err, 'finalize-build')
}
