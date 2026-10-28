import fs from 'fs/promises';
import path from 'path';
import { getFilesRecursive, print, errorExit } from '../../../utils/index.js';
import { BINARY_EXTENSIONS } from './binary-extensions.js';
import { PATHS } from './paths.js';
import { builderConfig } from '../../builder.config.js';

async function copyStatic() {
  const extensions = [...BINARY_EXTENSIONS, '.html'];
  // Templates are merged into these copies, then tsc checks them (and emits .js in dev).
  extensions.push('.ts');

  // Every build starts from a clean dist-build: a failed/interrupted prior
  // build never gets renamed away by finalize-build.js, so a stale sibling
  // (already merged, placeholder gone) can otherwise sit next to the next
  // run's fresh output and trip merge-templates.js's per-sibling check.
  await fs.rm(PATHS.temp, { recursive: true, force: true });
  await ensureDir(PATHS.tempSource);

  await copyPublic();
  await copyConfig();

  for (const extension of extensions) {
    const files = await getFilesRecursive(PATHS.source, extension);

    for (const file of files) {
      const relative = path.relative(PATHS.source, file);
      const dest = path.join(PATHS.tempSource, relative);

      try {
        await copyFile(file, dest);
      } catch (err) {
        throw new Error(`Failed to copy: ${file}. ${err.message}`, { cause: err });
      }
    }
  }

  // Whatever its type: fonts' licenses, an extension's _locales, .txt/.xml/.webmanifest files...
  await copyTree(path.join(PATHS.source, 'assets'), path.join(PATHS.tempSource, 'assets'));

  if (builderConfig.isProd) await copyJsonFiles(PATHS.source, PATHS.tempSource);
}

// OS and git housekeeping files stay behind; other dotfiles and folders (.well-known/) are copied.
const NOT_COPIED = new Set(['.DS_Store', 'Thumbs.db', '.gitkeep']);

async function copyTree(src, dest) {
  await fs.cp(src, dest, {
    recursive: true,
    filter: (file) => !NOT_COPIED.has(path.basename(file)),
  }).catch((err) => {
    if (err.code !== 'ENOENT') throw err;
  });
}

async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true });
}

async function copyFile(src, dest) {
  await ensureDir(path.dirname(dest));
  await fs.copyFile(src, dest);
}

// public/'s files are served from the site's root, as they are (never hashed or bundled).
async function copyPublic() {
  await copyTree(path.resolve('public'), PATHS.tempSource);
  try {
    await fs.access(path.resolve('public', 'favicon.ico'));
  } catch {
    print.warn('No favicon found at public/favicon.ico');
  }
}

async function copyConfig() {
  const srcPath = path.resolve(path.join('config'));
  const temp = builderConfig.isProd ? PATHS.temp : PATHS.tempSource;
  const destPath = path.join(temp, 'config');
  try {
    await copyJsonFiles(srcPath, destPath);
    await copyFile(path.resolve('nutin.config.js'), path.join(temp, 'nutin.config.js'));

    // for testin-nutin tests to run
    if (!builderConfig.isProd) {
      await copyJsonFiles(srcPath, path.join(PATHS.temp, 'config'));
      await copyFile(path.resolve('nutin.config.js'), path.join(PATHS.temp, 'nutin.config.js'));
    }
  } catch (err) {
    errorExit(err, 'copy-static');
  }
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
    }
  }
}

copyStatic().catch((err) => {
  errorExit(err, 'copy-static');
});
