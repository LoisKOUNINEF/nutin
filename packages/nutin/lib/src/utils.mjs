import { exec } from 'child_process';
import { promisify } from 'util';
import { print } from './print.mjs';

export const promiseExec = promisify(exec);

export function displaySuccessMessage(answers) {
  const { projectName, packageManager, deployHelper } = answers;
  print.boldSuccess('\n🎉 Your project is ready!');
  print.boldInfo(`Documentation on https://www.nutin.org`);

  if (packageManager === 'pnpm' || packageManager === 'bun') {
    if (deployHelper) print.boldError(`You'll need to modify the Dockerfile to support ${packageManager}`)
  }

  print.info('Next steps:');
  print.info(`  cd ${projectName} && ${packageManager} run serve\n`);
}
