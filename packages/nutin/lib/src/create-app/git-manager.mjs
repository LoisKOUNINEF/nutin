import { print } from '../utils/print.mjs';
import { execFileAsync, isGitAvailable } from '../common/git.mjs';

// A missing or failing git doesn't stop project creation: the project works without a repository.
export async function initializeGit(projectPath) {
  if (!(await isGitAvailable())) {
    print.warn('⚠️ git was not found — skipping "git init". Install git to version the project; nutin-update also needs it to merge files you edit.');
    return;
  }

  print.section('⚙️ Initializing Git repository...');
  try {
    await execFileAsync('git', ['init'], { cwd: projectPath });
  } catch (error) {
    print.warn(`⚠️ "git init" failed — skipping it (${(error.stderr || error.message).trim()}). Run it yourself once the issue is fixed.`);
  }
}
