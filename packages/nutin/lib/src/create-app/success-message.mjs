import { print } from '../utils/print.mjs';
import { PACKAGE_HOMEPAGE } from '../common/package-data.mjs';

export function displaySuccessMessage(answers) {
  const { projectName, packageManager, deployHelper } = answers;
  print.info(`Visit https://${PACKAGE_HOMEPAGE}`);

  print.boldSuccess('\n🎉 Your project is ready!\n');

  print.boldInfo('Next steps:');
  print.info(`cd ${projectName}`);
  print.info(`${packageManager} run serve\n`);
}
