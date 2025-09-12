import fs from 'fs/promises';
import path from 'path';
import { exit } from 'process';

import { BINARY_EXTENSIONS } from '../variables/binary-extensions.js';
import { getFilesRecursive, print } from '../../utils/index.js';

const SOURCE_FOLDER = 'src';
const DEST_FOLDER = `dist/${SOURCE_FOLDER}`;

async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true });
}

async function copyFile(src, dest) {
  await ensureDir(path.dirname(dest));
  await fs.copyFile(src, dest);
}

async function copyFavicon() {
  const srcPath = path.join('public', 'favicon.ico');
  const destPath = path.join( DEST_FOLDER, 'favicon.ico');

  try {
    await copyFile(srcPath, destPath);
    print.info('✅ Copied: favicon.ico');
  } catch {
    print.boldError('⚠️  No favicon found at public/favicon.ico\x1b[0m');
  }
}

async function copyStatic() {
  const extensions = [...BINARY_EXTENSIONS, 'html'];

  await ensureDir(path.join(DEST_FOLDER));
  await copyFavicon();

  for (const extension of extensions) {
    const files = await getFilesRecursive(SOURCE_FOLDER, extension);

    for (const file of files) {
      const relative = path.relative(SOURCE_FOLDER, file);
      const dest = path.join(DEST_FOLDER, relative);

      try {
        await copyFile(file, dest);
        print.info(`✅ Copied: ${file} → ${dest}`);
      } catch (err) {
        print.error(`❌ Failed to copy: ${file}. ${err.message}`);
        exit(1);
      }
    }
  }

  await copyJsonFiles(SOURCE_FOLDER, DEST_FOLDER)
}

async function copyJsonFiles(sourceDir, destDir) {
  
  const items = await fs.readdir(sourceDir, { withFileTypes: true });

  for (const item of items) {
    const sourcePath = path.join(sourceDir, item.name);
    const destPath = path.join(destDir, item.name);

    if (item.isDirectory()) {
      await copyJsonFiles(sourcePath, destPath);
    } else if (item.isFile() && path.extname(item.name) === '.json') {
      await fs.mkdir(path.dirname(destPath), { recursive: true });
      await fs.copyFile(sourcePath, destPath);
      console.log(`Copied JSON: ${sourcePath} -> ${destPath}`);
    }
  }
}

copyStatic().catch((err) => {
  print.boldError(`Unexpected error: ${err.message}`);
  exit(1);
});
