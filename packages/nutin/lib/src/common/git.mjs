import { execFile } from 'child_process';
import { promisify } from 'util';
import { print } from '../utils/print.mjs';
import { UserError } from '../utils/errors.mjs';

export const execFileAsync = promisify(execFile);

// nutin-new runs `git init` with it, and nutin-update needs it to merge files you edited.
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

// Reverts everything a command wrote in a project folder that was committed before it ran.
export const UNDO_COMMAND = 'git checkout -- . && git clean -fd';

// what: 'update', 'change'...: "To undo this <what>".
export function printUndoHint(what) {
  print.info(`\nTo undo this ${what}, run from the project folder: ${UNDO_COMMAND}`);
  print.warn('It also removes the untracked files and folders in the project folder.');
}

// subject: what must be undoable: getWorkingTreeStatus()'s porcelain lines.
export function dirtyTreeError(subject, changes) {
  return new UserError(
    `Commit or stash your changes first (untracked files included), so ${subject} can be undone with git, ` +
    `or pass --allow-dirty.\nNo files were changed.\n${changes.length} changes pending.`,
  );
}

// action: what can't be undone.
export function noGitWarning({ gitFound }, action) {
  return gitFound
    ? `⚠️  This project isn't in a git repository, so ${action} can't be undone with git. Run "git init" and commit to make it undoable.`
    : `⚠️  git was not found, so ${action} can't be undone with git.`;
}
