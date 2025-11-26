import * as fs from 'fs';
import * as path from 'path';

export function getFilesRecursive(dir, extension) {
  const fullDir = path.resolve(dir);
  if (!fs.existsSync(fullDir)) return [];

  // Normalize to an array of extensions, with leading dots
  const exts = Array.isArray(extension)
    ? extension
    : [extension];

  const normalizedExts = exts.map(ext =>
    ext.startsWith('.') ? ext : `.${ext}`
  );

  function findFilesRecursively(currentDir) {
    const files = [];
    const items = fs.readdirSync(currentDir, { withFileTypes: true });

    for (const item of items) {
      const fullPath = path.join(currentDir, item.name);

      if (item.isDirectory()) {
        files.push(...findFilesRecursively(fullPath));
      } else if (item.isFile()) {
        if (normalizedExts.some(ext => item.name.endsWith(ext))) {
          files.push(fullPath);
        }
      }
    }
    return files;
  }

  return findFilesRecursively(fullDir);
}
