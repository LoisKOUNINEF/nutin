import { getCiCommand } from './package-manager.mjs';
import { packageVersion } from './version.mjs';

const PRESET_MAP = {
  default: { libs: false, deployHelper: false, testinNutin: false },
  minimal: { libs: false, deployHelper: false, testinNutin: false },
  standard: { libs: true, deployHelper: false, testinNutin: false },
  full:     { libs: true, deployHelper: true,  testinNutin: true  },
  cicd:     { libs: false, deployHelper: true,  testinNutin: false },
};

export const defaults = {
  projectName: 'my-nutin-app',
  packageManager: 'npm',
  ...PRESET_MAP['default']
};

export class ContextBuilder {
	buildContext(preferences) { 
    const version = packageVersion;
    const ciCommand = getCiCommand(preferences.packageManager);

    const preset = PRESET_MAP[preferences.preset] ?? PRESET_MAP['default'];

    return {
      projectName: preferences.projectName,
      packageManager: preferences.packageManager,

      externalTemplates: !preferences.externalTemplates ?? true,
      libs: preset.libs,
      deployHelper: preferences.deployHelper ?? preset.deployHelper,
      testinNutin: preferences.testinNutin ?? preset.testinNutin,

      ciCommand: ciCommand,
      version: version
    };
  }
}
