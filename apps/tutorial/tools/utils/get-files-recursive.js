import * as fs from 'fs';
import * as path from 'path';

export function getFilesRecursive(dir, extension) {
  const fullDir = path.resolve(process.cwd(), dir);

  if (!fs.existsSync(fullDir)) return [];
  
  function findFilesRecursively(currentDir) {
    const files = [];
    const items = fs.readdirSync(currentDir, { withFileTypes: true });
    
    for (const item of items) {
      const fullPath = path.join(currentDir, item.name);
      
      if (item.isDirectory()) {
        // Recursively search subdirectories
        files.push(...findFilesRecursively(fullPath));
      } else if (item.isFile() && item.name.endsWith(extension)) {
        // Add  files to the results
        files.push(fullPath);
      }
    }
    
    return files;
  }
  
  return findFilesRecursively(fullDir);
}
