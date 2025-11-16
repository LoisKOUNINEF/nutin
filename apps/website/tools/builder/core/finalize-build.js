import { print, isProd, isVerbose } from "../../utils/index.js";
import fs from 'fs';
import path from 'path';
import { PATHS } from "./paths.js";

function removeFoldersAfterBundle() {
  const foldersToRemove = ['core', 'libs', 'app'];
  const pathToFolder = (folder) => path.join(PATHS.tempSource, folder);
  foldersToRemove.forEach(folder => fs.rmSync(pathToFolder(folder), { recursive : true }));
  fs.rmSync(path.join(PATHS.temp, 'config'), { recursive : true });
}

function replaceDir(src, dest) {
  fs.rmSync(dest, { recursive: true, force: true });
  fs.renameSync(src, dest);
}

function finalizeBuild() {
  if (isProd) removeFoldersAfterBundle();
  replaceDir(PATHS.temp, PATHS.build);
  if (isVerbose) print.boldInfo('Build finalized.\n');
}

finalizeBuild();
