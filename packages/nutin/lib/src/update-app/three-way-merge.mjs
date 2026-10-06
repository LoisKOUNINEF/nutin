import os from 'os';
import path from 'path';
import * as fsExtra from 'fs-extra';
import { execFileAsync } from '../common/git.mjs';

const fs = fsExtra.default;

export const CONFLICT_MARKER = '<<<<<<< yours';

// Merges nutin's changes (base -> theirs) into your file with `git merge-file`, which needs the git
// binary but no repository. Overlapping edits get diff3 markers: yours, the old nutin version, the new one.
export async function mergeFile({ base, yours, theirs, labels }) {
  const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'nutin-merge-'));
  try {
    const [yoursPath, basePath, theirsPath] = ['yours', 'base', 'theirs'].map((name) => path.join(tmpDir, name));
    await Promise.all([
      fs.writeFile(yoursPath, yours),
      fs.writeFile(basePath, base),
      fs.writeFile(theirsPath, theirs),
    ]);

    const args = ['merge-file', '-p', '--diff3', '-L', 'yours', '-L', labels.base, '-L', labels.theirs, yoursPath, basePath, theirsPath];
    try {
      const { stdout } = await execFileAsync('git', args, { maxBuffer: 1024 * 1024 * 50 });
      return { content: stdout, conflictCount: 0 };
    } catch (error) {
      // A positive exit code below 255 is the number of conflicts; anything else is a real failure.
      if (Number.isInteger(error.code) && error.code > 0 && error.code < 255) {
        return { content: error.stdout, conflictCount: error.code };
      }
      throw error;
    }
  } finally {
    await fs.remove(tmpDir);
  }
}

export async function hasConflictMarkers(filePath) {
  if (!(await fs.pathExists(filePath))) return false;
  const content = await fs.readFile(filePath, 'utf8');
  return content.split('\n').some((line) => line.startsWith(CONFLICT_MARKER));
}
