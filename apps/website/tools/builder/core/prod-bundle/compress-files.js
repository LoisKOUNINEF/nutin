import { readFileSync, writeFileSync } from 'fs';
import { gzipSync, brotliCompressSync, constants } from 'zlib';
import { print, getFilesRecursive, errorExit } from '../../../utils/index.js';
import { PATHS } from '../app/paths.js';

function compressStaticAssets() {
  const files = getFilesRecursive(
    PATHS.tempSource,
    ['.js', '.css', '.json', '.svg', '.ttf', '.otf', '.eot']
  );
  
  for (const file of files) {
    const content = readFileSync(file);

    const gzipped = gzipSync(content, {
      level: 9,
      memLevel: 9,
      windowBits: 15
    });
    writeFileSync(`${file}.gz`, gzipped);
    
    const brotlied = brotliCompressSync(content, {
      params: {
        [constants.BROTLI_PARAM_QUALITY]: 11,
        [constants.BROTLI_PARAM_MODE]: constants.BROTLI_MODE_GENERIC,
        [constants.BROTLI_PARAM_SIZE_HINT]: content.length
      }
    });
    writeFileSync(`${file}.br`, brotlied);
  };
}

try {
  compressStaticAssets()
} catch(err) {
  errorExit(err, 'compress-files');
}
