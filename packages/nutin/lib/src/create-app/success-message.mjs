import { print } from '../utils/print.mjs';
import { PACKAGE_HOMEPAGE } from '../common/package-data.mjs';

export function displaySuccessMessage(answers) {
  const { projectName, packageManager, deployHelper } = answers;
  print.boldSuccess('\n🎉 Your project is ready!');
  print.boldInfo(`Documentation on https://${PACKAGE_HOMEPAGE}`);

  if (packageManager === 'pnpm' || packageManager === 'bun') {
    if (deployHelper) print.boldError(`You'll need to modify the Dockerfile to support ${packageManager}`)
  }

  print.info('Next steps:');
  print.info(`  cd ${projectName} && ${packageManager} run serve\n`);
}
