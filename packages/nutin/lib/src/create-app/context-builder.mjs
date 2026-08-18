import { getCiCommand } from '../common/package-json-helper.mjs';
import { PACKAGE_VERSION } from '../common/package-data.mjs';

export const defaults = {
  projectName: 'my-nutin-app',
  packageManager: 'npm',
};

export class ContextBuilder {
	buildContext(preferences) { 
    const version = PACKAGE_VERSION;
    const ciCommand = getCiCommand(preferences.packageManager);

    return {
      projectName: preferences.projectName,
      packageManager: preferences.packageManager,
      ciCommand: ciCommand,
      version: version
    };
  }
}
