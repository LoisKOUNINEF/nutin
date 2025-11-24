import { readFileSync, writeFileSync } from 'fs';
import { gzipSync
// BROTLI OPTIONAL
//, brotliCompressSync, constants 
} from 'zlib';
import { print, getFilesRecursive, isVerbose } from '../../utils/index.js';
import { PATHS } from './paths.js';
import builderConfig from '../../../builder.config.js';

const compress = {
  gzip: builderConfig.compression.gzip,
  // BROTLI OPTIONAL
  // brotli: builderConfig.compression.brotli,
};

function compressStaticAssets() {
  if (
    !compress.gzip 
    // BROTLI OPTIONAL
    // && !compress.brotli
  ) return;

  const files = getFilesRecursive(PATHS.tempSource, ['.js', '.css', '.json', '.svg', 'ttf', 'otf', 'eot']);
  
  files.forEach(file => {
    const content = readFileSync(file);
    
    if (compress.gzip) {
      const gzipped = gzipSync(content, {
        level: 9,
        memLevel: 9,
        windowBits: 15
      });
      writeFileSync(`${file}.gz`, gzipped);
      if (isVerbose) print.info(`Gzip compression: ${file}`);
    }

    // BROTLI OPTIONAL
    /*
    if (compress.brotli) {
     const brotlied = brotliCompressSync(content, {
       params: {
         [constants.BROTLI_PARAM_QUALITY]: 11,
         [constants.BROTLI_PARAM_LGWIN]: 22,
         [constants.BROTLI_PARAM_MODE]: constants.BROTLI_MODE_GENERIC,
         [constants.BROTLI_PARAM_SIZE_HINT]: content.length
       }
     });
     writeFileSync(`${file}.br`, brotlied);
     if (isVerbose) print.info(`Brotli compression: ${file}`);
    }
    */
  });
}

compressStaticAssets();