import path from 'path';
import { fileURLToPath } from 'url';
import * as fsExtra from 'fs-extra';
import { print } from '../utils/print.mjs';
import { FileGenerator } from '../common/file-generator.mjs';
import { FEATURES } from '../common/feature-registry.mjs';
import { PACKAGE_VERSION } from '../common/package-data.mjs';
import { installDependencies } from '../common/package-json-helper.mjs';
import { readProjectMeta, updateProjectMeta } from '../common/project-meta.mjs';
import { FeatureContextBuilder } from './feature-context-builder.mjs';
import { updatePackageJson } from './package-json-updater.mjs';

const fs = fsExtra.default;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class FeatureAdder {
  constructor() {
    this.fileGenerator = new FileGenerator();
    this.builder = new FeatureContextBuilder();
  }

  async addFeatureToProject(featureKey) {
    const feature = FEATURES.find((candidate) => candidate.key === featureKey);
    if (!feature) {
      throw new Error(`Unknown feature: ${featureKey}`);
    }

    const projectPath = process.cwd();
    await this.validateProject(projectPath, feature);

    const meta = await readProjectMeta(projectPath);
    if (meta?.features?.[feature.key]) {
      print.gray(`${feature.key} is already enabled in this project — skipping.`);
      return;
    }

    print.boldInfo(`\nAdding ${feature.key} to ${projectPath}...`);

    const context = await this.builder.buildContext(projectPath, feature);

    await this.applyFeatureTemplate(projectPath, feature, context);
    await this.runPostAddTasks(projectPath, feature, context);

    print.boldInfo(`${feature.key} added.`);
  }

  async validateProject(projectPath, feature) {
    const packageJsonPath = path.join(projectPath, 'package.json');
    if (!(await fs.pathExists(packageJsonPath))) {
      throw new Error(`No package.json found in ${projectPath} — run this from a nutin project's root.`);
    }
    if (!(await fs.pathExists(path.join(projectPath, 'nutin.config.js')))) {
      throw new Error(`No nutin.config.js file found in ${projectPath} — is this a nutin project?`);
    }
  }

  async applyFeatureTemplate(projectPath, feature, context) {
    const featureTemplateDir = path.join(__dirname, '..', '..', '..', 'templates', 'features', feature.key);

    await this.fileGenerator.processTemplateDirectory(featureTemplateDir, projectPath, context, { skipExisting: true });

    await updatePackageJson(projectPath, feature, context);
  }

  async runPostAddTasks(projectPath, feature, context) {
    await updateProjectMeta(projectPath, {
      version: PACKAGE_VERSION,
      packageManager: context.packageManager,
      features: { [feature.key]: true },
    });
    if (feature.key === 'docker') return;
    await installDependencies(projectPath, context.packageManager);
  }
}

export const featureAdder = new FeatureAdder();

export async function addFeatureToProject(featureKey) {
  return featureAdder.addFeatureToProject(featureKey);
}
