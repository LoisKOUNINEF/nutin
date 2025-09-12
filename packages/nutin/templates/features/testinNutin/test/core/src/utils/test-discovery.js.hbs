import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function getTestFiles(dir) {
  const fullDir = path.resolve(__dirname,'../', '../', '../', dir);
  if (!fs.existsSync(fullDir)) return [];
  
  function findTestFilesRecursively(currentDir) {
    const testFiles = [];
    const items = fs.readdirSync(currentDir, { withFileTypes: true });
    
    for (const item of items) {
      const fullPath = path.join(currentDir, item.name);
      
      if (item.isDirectory()) {
        // Recursively search subdirectories
        testFiles.push(...findTestFilesRecursively(fullPath));
      } else if (item.isFile() && item.name.endsWith('.test.js')) {
        // Add test files to the results
        testFiles.push(fullPath);
      }
    }
    
    return testFiles;
  }
  
  return findTestFilesRecursively(fullDir);
}
