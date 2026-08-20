import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { PATHS } from '../app/paths.js';
import { print, getFilesRecursive, errorExit } from '../../../utils/index.js';

function addHashToFiles(distDir) {
  const files = getFilesRecursive(distDir, ['.js', '.css']);

  const fileMap = {}; // Track old → new filenames

  files.forEach(fullPath => {
    const ext = path.extname(fullPath);
    const dirOfFile = path.dirname(fullPath);
    const name = path.basename(fullPath, ext);

    const hash = hashFile(fullPath);
    const newName = `${name}.${hash}${ext}`;
    const newPath = path.join(dirOfFile, newName);

    fs.renameSync(fullPath, newPath);

    const oldRel = path.relative(distDir, fullPath).replace(/\\/g, '/');
    const newRel = path.relative(distDir, newPath).replace(/\\/g, '/');

    fileMap[oldRel] = newRel;
  });

  updateHtmlReferences(path.join(distDir, 'index.html'), fileMap);
}

function hashFile(filePath) {
  const content = fs.readFileSync(filePath);
  return crypto.createHash('sha256').update(content).digest('hex').substring(0, 8);
}

function escapeRegExp(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function updateHtmlReferences(htmlPath, fileMap) {
  let html = fs.readFileSync(htmlPath, 'utf8');

  Object.entries(fileMap).forEach(([oldName, newName]) => {
    html = html.replace(new RegExp(escapeRegExp(oldName), 'g'), newName);
  });

  fs.writeFileSync(htmlPath, html);
}

try {
  addHashToFiles(PATHS.tempSource)
} catch(err) {
  errorExit(err, 'hash-files');
}
