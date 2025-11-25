import { getCiCommand } from './package-manager.mjs';
import { packageVersion } from './version.mjs';

export const defaults = {
  projectName: 'my-nutin-app',
  packageManager: 'npm',
  stylinNutin: true,
  template: true,
  i18n: true,
  deployHelper: false,
  testinNutin: false,
  transition: false
};

export class ContextBuilder {
	buildContext(answers) { 
    const version = packageVersion;
    const ciCommand = getCiCommand(answers.packageManager);

    return {
      projectName: answers.projectName,
      packageManager: answers.packageManager,
      
      template: answers.template ?? defaults.template,
      stylinNutin: answers.stylinNutin ?? defaults.stylinNutin,
      i18n: answers.i18n ?? defaults.i18n,
      deployHelper: answers.deployHelper ?? defaults.deployHelper,
      testinNutin: answers.testinNutin ?? defaults.testinNutin,
      transition: answers.transition ?? defaults.transition,

      ciCommand: ciCommand,
      version: version
    };
  }
}
