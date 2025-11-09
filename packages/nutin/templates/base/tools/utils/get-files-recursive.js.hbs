import * as fs from 'fs';
import * as path from 'path';

export function getFilesRecursive(dir, extension) {
  const fullDir = path.resolve(dir);

  if (!fs.existsSync(fullDir)) return [];
  
  function findFilesRecursively(currentDir) {
    const files = [];
    const items = fs.readdirSync(currentDir, { withFileTypes: true });
    
    for (const item of items) {
      const fullPath = path.join(currentDir, item.name);
      
      if (item.isDirectory()) {
        files.push(...findFilesRecursively(fullPath));
      } else if (item.isFile() && item.name.endsWith(extension)) {
        files.push(fullPath);
      }
    }
    
    return files;
  }
  
  return findFilesRecursively(fullDir);
}
