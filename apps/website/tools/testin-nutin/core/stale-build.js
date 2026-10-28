import fs from 'fs';
import path from 'path';

// Written by finalize-build.js when a build succeeds.
export const BUILD_STAMP = path.join('dist', '.build-time');
// What the build reads. Tests aren't built: the runner imports them from src/ directly.
const BUILD_INPUTS = ['src', 'config', 'nutin.config.js'];
const isTestFile = (file) => /\.test\.js$/.test(file);

// The first build input changed since the last successful build, or null. Tests run against
// dist/, so after a failed build (or an edit without a rebuild) they'd test the old code
// and could pass. Also null when there's no stamp (no build yet, or one from before stamps).
export function findChangedSinceBuild(root = process.cwd()) {
  let builtAt;
  try {
    builtAt = fs.statSync(path.join(root, BUILD_STAMP)).mtimeMs;
  } catch {
    return null;
  }

  for (const input of BUILD_INPUTS) {
    const changed = findNewer(path.join(root, input), builtAt);
    if (changed) return path.relative(root, changed);
  }
  return null;
}

function findNewer(entry, builtAt) {
  let stat;
  try {
    stat = fs.statSync(entry);
  } catch {
    return null;
  }
  if (stat.isFile()) return !isTestFile(entry) && stat.mtimeMs > builtAt ? entry : null;

  for (const item of fs.readdirSync(entry, { withFileTypes: true })) {
    if (item.name.startsWith('.')) continue;
    const changed = findNewer(path.join(entry, item.name), builtAt);
    if (changed) return changed;
  }
  return null;
}
