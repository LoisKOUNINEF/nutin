import { print, isProd, isVerbose } from "../../utils/index.js";
import fs from 'fs';
import path from 'path';
import { PATHS } from "./paths.js";

function finalizeBuild() {
  if (isProd) removeFoldersAfterBundle();
  replaceDir(PATHS.temp, PATHS.build);
  if (isVerbose) print.boldInfo('Build finalized.\n');
}

function removeFoldersAfterBundle() {
  const foldersToRemove = ['core', 'libs', 'app'];
  const pathToFolder = (folder) => path.join(PATHS.tempSource, folder);

  foldersToRemove.forEach(folder => fs.rmSync(pathToFolder(folder), { recursive : true }));
}

function replaceDir(src, dest) {
  fs.rmSync(dest, { recursive: true, force: true });
  fs.renameSync(src, dest);
}

finalizeBuild();
