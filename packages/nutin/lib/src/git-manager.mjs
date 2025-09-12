import { print } from './print.mjs';
import { promiseExec } from './utils.mjs';

export async function initializeGit(projectPath) {
  print.section('\n🔧 Initializing Git repository...');
  await promiseExec('git init', { cwd: projectPath });
}
