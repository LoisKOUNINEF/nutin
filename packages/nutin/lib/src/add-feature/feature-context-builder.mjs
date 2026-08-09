import path from 'path';
import * as fsExtra from 'fs-extra';
import { getCiCommand, detectPackageManager } from '../common/package-json-helper.mjs';
import { PACKAGE_VERSION } from '../common/package-data.mjs';

const fs = fsExtra.default;

export class FeatureContextBuilder {
  async buildContext(projectPath, feature) {
    const packageJson = await fs.readJSON(path.join(projectPath, 'package.json'));
    const packageManager = await detectPackageManager(projectPath);

    return {
      projectName: packageJson.name,
      packageManager,
      ciCommand: getCiCommand(packageManager),
      version: PACKAGE_VERSION,
      [feature.key]: true,
    };
  }
}
