import path from 'path';
import * as fsExtra from 'fs-extra';
import { getCiCommand, detectPackageManager } from '../common/package-json-helper.mjs';
import { PACKAGE_VERSION as packageVersion } from '../common/package-data.mjs';

const fs = fsExtra.default;

export class UpdateContextBuilder {
  async buildContexts(projectPath, meta) {
    const packageJson = await fs.readJSON(path.join(projectPath, 'package.json'));
    const packageManager = meta.packageManager ?? (await detectPackageManager(projectPath));

    const baseContext = {
      projectName: packageJson.name,
      packageManager,
      ...meta.features,
      ciCommand: getCiCommand(packageManager),
    };

    return {
      oldContext: { ...baseContext, version: meta.version },
      newContext: { ...baseContext, version: packageVersion },
    };
  }
}
