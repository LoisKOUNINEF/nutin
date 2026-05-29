import { getCiCommand } from './package-manager.mjs';
import { packageVersion } from './version.mjs';

const PRESET_MAP = {
  default: { template: false, stylinNutin: false, i18n: false, deployHelper: false, testinNutin: false },
  minimal: { template: true, stylinNutin: false, i18n: false, deployHelper: false, testinNutin: false },
  standard: { template: true, stylinNutin: true,  i18n: true,  deployHelper: false, testinNutin: false },
  full:     { template: true, stylinNutin: true,  i18n: true,  deployHelper: true,  testinNutin: true  },
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

    const preset = PRESET_MAP[preferences.preset] ?? PRESET_MAP.default;

    const stylinNutin =
      preferences.stylinNutin ?? preset.stylinNutin;

    const i18n =
      preferences.i18n ?? preset.i18n;

    const deployHelper =
      preferences.deployHelper ?? preset.deployHelper;

    const testinNutin =
      preferences.testinNutin ?? preset.testinNutin;

    return {
      projectName: preferences.projectName,
      packageManager: preferences.packageManager,

      template: preset.template,

      stylinNutin,
      i18n,
      deployHelper,
      testinNutin,

      hasDataAttributes: i18n || stylinNutin,

      ciCommand,
      version
    };
  }
}
