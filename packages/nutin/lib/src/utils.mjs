import { exec } from 'child_process';
import { promisify } from 'util';
import { print } from './print.mjs';

export const promiseExec = promisify(exec);

export function displaySuccessMessage(answers) {
  const { projectName, installDeps, packageManager } = answers;
  
  print.boldSuccess('\n🎉 Your project is ready!');
  print.info('\nNext steps:');
  print.info(`  cd ${projectName} && npm run serve`);
  
  print.success('\nHappy coding! 🚀\n');
}
