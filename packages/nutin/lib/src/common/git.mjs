import { execFile } from 'child_process';
import { promisify } from 'util';

export const execFileAsync = promisify(execFile);

// nutin new runs `git init` with it, and nutin-update needs it to merge files you edited.
export async function isGitAvailable() {
  try {
    await execFileAsync('git', ['--version']);
    return true;
  } catch {
    return false;
  }
}

// The project folder's uncommitted changes, untracked files included (ignored ones aren't listed).
// Scoped to the folder, so a project inside a bigger repository isn't blocked by changes elsewhere.
// `repo: false` when git is missing or the folder isn't in a repository.
export async function getWorkingTreeStatus(projectPath) {
  try {
    await execFileAsync('git', ['rev-parse', '--is-inside-work-tree'], { cwd: projectPath });
  } catch {
    return { repo: false, gitFound: await isGitAvailable(), changes: [] };
  }
  const { stdout } = await execFileAsync(
    'git',
    ['status', '--porcelain', '--untracked-files=all', '--', '.'],
    { cwd: projectPath, maxBuffer: 1024 * 1024 * 10 },
  );
  return { repo: true, gitFound: true, changes: stdout.split('\n').filter(Boolean) };
}
