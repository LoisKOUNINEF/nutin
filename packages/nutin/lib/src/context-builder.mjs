import { getCiCommand } from './package-manager.mjs';
import { packageVersion } from './version.mjs';

export class ContextBuilder {
	buildContext(answers) { 
    const version = packageVersion;
    const ciCommand = getCiCommand(answers.packageManager);

    return {
      projectName: answers.projectName,
      packageManager: answers.packageManager,
      
      template: answers.template,
      stylinNutin: answers.stylinNutin,
      i18n: answers.i18n,
      transition: answers.transition,
      testinNutin: answers.testinNutin,

      ciCommand: ciCommand,
      version: version
    };
  }
}