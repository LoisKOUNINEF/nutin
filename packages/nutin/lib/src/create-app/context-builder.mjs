import { getCiCommand } from '../common/package-json-helper.mjs';
import { PACKAGE_VERSION } from '../common/package-data.mjs';

const LIBS_ON = { accessibilityComponents: true, forms: true, overlays: true, scssUtils: true };
const LIBS_OFF = { accessibilityComponents: false, forms: false, overlays: false, scssUtils: false };

const PRESET_MAP = {
  default:  { ...LIBS_OFF, deployHelper: false, testinNutin: false }, 
  standard: { ...LIBS_ON,  deployHelper: false, testinNutin: false },
  full:     { ...LIBS_ON,  deployHelper: true,  testinNutin: true  },
};

export const defaults = {
  projectName: 'my-nutin-app',
  packageManager: 'npm',
  ...PRESET_MAP['default']
};

export class ContextBuilder {
	buildContext(preferences) { 
    const version = PACKAGE_VERSION;
    const ciCommand = getCiCommand(preferences.packageManager);

    const preset = PRESET_MAP[preferences.preset] ?? PRESET_MAP['default'];

    return {
      projectName: preferences.projectName,
      packageManager: preferences.packageManager,

      accessibilityComponents: preferences.libs ?? preset.accessibilityComponents,
      forms: preferences.libs ?? preset.forms,
      overlays: preferences.libs ?? preset.overlays,
      scssUtils: preferences.libs ?? preset.scssUtils,
      deployHelper: preferences.deployHelper ?? preset.deployHelper,
      testinNutin: preferences.testinNutin ?? preset.testinNutin,

      ciCommand: ciCommand,
      version: version
    };
  }
}
