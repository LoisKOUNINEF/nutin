import { print, isProd } from "../../utils/index.js";
import fs from 'fs';
import path from 'path';
import { PATHS } from "./paths.js";

function removeFoldersAfterBundle() {
  const foldersToRemove = ['core', 'libs', 'app'];
  const pathToFolder = (folder) => path.join(PATHS.tempSource, folder);

  foldersToRemove.forEach(folder => fs.rmSync(pathToFolder(folder), { recursive : true }));
}

function replaceDir(src, dest) {
  fs.rmSync(dest, { recursive: true, force: true });
  fs.renameSync(src, dest);
}

function finalizeBuild() {
  if (isProd) removeFoldersAfterBundle();
  replaceDir(PATHS.temp, PATHS.build);
  print.info('Build finalized.');
}

finalizeBuild();
