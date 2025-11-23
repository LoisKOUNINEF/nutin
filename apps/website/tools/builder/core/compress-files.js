import { readFileSync, writeFileSync } from 'fs';
import { gzipSync } from 'zlib';
import { print, getFilesRecursive, isVerbose } from '../../utils/index.js';
import { PATHS } from './paths.js';

function compressStaticAssets() {
  const files = getFilesRecursive(PATHS.tempSource, ['.js', '.css', '.json', '.svg', 'ttf', 'otf', 'eot']);
  
  files.forEach(file => {
    const content = readFileSync(file);
    const gzipped = gzipSync(content, { level: 9 });
    writeFileSync(`${file}.gz`, gzipped);
    
    if (isVerbose) print.info(`Compressed: ${file}`);
  });
}

compressStaticAssets();