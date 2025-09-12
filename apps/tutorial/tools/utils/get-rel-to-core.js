import * as path from 'path';

export function getRelToCore(targetPath) {
  const depth = targetPath.split(path.sep).length;
  const relToCore = '../'.repeat(depth - 1) + 'core/index.js';
  return relToCore;
}
