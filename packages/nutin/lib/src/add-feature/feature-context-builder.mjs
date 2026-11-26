import path from 'path';
import { getCiCommand, detectPackageManager } from '../common/package-json-helper.mjs';
import { PACKAGE_VERSION } from '../common/package-data.mjs';
import { readProjectMeta } from '../common/project-meta.mjs';
import { bootstrapProjectMeta } from '../common/meta-bootstrap-prompt.mjs';
import { realWriter } from '../common/project-writer.mjs';

export class FeatureContextBuilder {
  // Reads through the writer: with `nutin-add all`, the features added before this one count.
  async buildContext(projectPath, feature, writer = realWriter) {
    const packageJson = await writer.readJSON(path.join(projectPath, 'package.json'));
    const packageManager = await detectPackageManager(projectPath);
    const meta = (await readProjectMeta(projectPath, writer)) ?? (await bootstrapProjectMeta(projectPath, writer));

    return {
      projectName: packageJson.name,
      packageManager,
      lang: meta.lang ?? 'ts',
      extension: meta.extension ?? false,
      ciCommand: getCiCommand(packageManager),
      version: PACKAGE_VERSION,
      ...(meta.features ?? {}),
      [feature.key]: true,
    };
  }
}
