import { exec } from 'child_process';
import { promisify } from 'util';
import { print } from './print.mjs';

export const promiseExec = promisify(exec);

export function displaySuccessMessage(answers) {
  const { projectName } = answers;
  
  print.boldSuccess('\n🎉 Your project is ready!');
  print.info('\nNext steps:');
  print.info(`  cd ${projectName} && npm run serve`);
  print.boldInfo(`\nDocumentation on https://www.nutin.org`);
  
  print.success('\nHappy coding! 🚀\n');
}

export const packageVersion = '1.2.1';
