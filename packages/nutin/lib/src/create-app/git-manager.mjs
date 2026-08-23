import { print } from '../utils/print.mjs';
import { promiseExec } from '../utils/promise-exec-alias.mjs';

export async function initializeGit(projectPath) {
  print.section('⚙️ Initializing Git repository...');
  await promiseExec('git init', { cwd: projectPath });
}
