import { print } from '../utils/print.mjs';
import { PACKAGE_HOMEPAGE } from '../common/package-data.mjs';

export function displaySuccessMessage(answers) {
  const { projectName, packageManager, extension } = answers;
  print.boldSuccess('\n🎉 Your project is ready!\n');

  print.boldInfo('Next steps:');
  print.info(`cd ${projectName}`);
  if (extension) {
    print.info(`${packageManager} run build`);
    print.info('Then load dist/chrome unpacked in chrome://extensions (Developer mode), or dist/firefox/manifest.json in Firefox\'s about:debugging.');
  } else {
    print.info(`${packageManager} run serve`);
  }
  print.info(`\nDocumentation: https://${PACKAGE_HOMEPAGE}\n`);
}
