import { getCiCommand } from './package-manager.mjs';
import { packageVersion } from './version.mjs';

export class ContextBuilder {
	defaultAnswers = {
	  template: true,
    stylinNutin: true,
    i18n: true,
    transition: false,
    testinNutin: false,
    packageManager: 'npm',
	};

	buildContext(answers) { 
    const version = packageVersion;
    const ciCommand = getCiCommand(answers.packageManager);

    return {
      projectName: answers.projectName,
      
      template: answers.template || this.defaultAnswers.template,
      stylinNutin: answers.stylinNutin || this.defaultAnswers.stylinNutin,
      i18n: answers.i18n || this.defaultAnswers.i18n,
      transition: answers.transition || this.defaultAnswers.transition,
      testinNutin: answers.testinNutin || this.defaultAnswers.testinNutin,

      hasFeatures: answers.template || answers.stylinNutin || answers.i18n || answers.transition || answers.testinNutin,
      
      year: new Date().getFullYear(),
      packageManager: answers.packageManager || this.defaultAnswers.packageManager,
      ciCommand: ciCommand,
      version: version
    };
  }
}