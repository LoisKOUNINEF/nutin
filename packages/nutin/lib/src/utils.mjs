import { exec } from 'child_process';
import { promisify } from 'util';
import { print } from './print.mjs';

export const promiseExec = promisify(exec);

export function displaySuccessMessage(answers) {
  const { projectName } = answers;
  print.boldSuccess('\n🎉 Your project is ready!');
  print.boldInfo(`Documentation on https://www.nutin.org`);
  print.info('Next steps:');
  print.info(`  cd ${projectName} && npm run serve\n`);
}
