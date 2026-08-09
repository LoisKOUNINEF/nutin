import path from 'path';
import { fileURLToPath } from 'url';
import * as fsExtra from 'fs-extra';
import { print } from '../utils/print.mjs';
import { FileGenerator } from '../common/file-generator.mjs';
import { FEATURES } from '../common/feature-registry.mjs';
import { PACKAGE_VERSION } from '../common/package-data.mjs';
import { updateProjectMeta } from '../common/project-meta.mjs';
import { FeatureContextBuilder } from './feature-context-builder.mjs';
import { updateLibBarrels } from './lib-barrel-updater.mjs';
import { ensureScssConfigFile } from './scss-config-generator.mjs';
import { ensureTestinNutinConfigBlock } from './testin-nutin-config-updater.mjs';
import { updatePackageJson } from './package-json-updater.mjs';

const fs = fsExtra.default;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const nutinConfigFileName = 'nutin.config.js';

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

    print.boldHead(`\nAdding ${feature.key} to ${projectPath}...\n`);

    const context = await this.builder.buildContext(projectPath, feature);

    await this.applyFeatureTemplate(projectPath, feature, context);
    await this.runPostAddTasks(projectPath, feature, context);

    print.boldSuccess(`✅ ${feature.key} added.`);
  }

  async validateProject(projectPath, feature) {
    const packageJsonPath = path.join(projectPath, 'package.json');
    if (!(await fs.pathExists(packageJsonPath))) {
      throw new Error(`No package.json found in ${projectPath} — run this from a nutin project's root.`);
    }
    if (feature.scssForward && !(await fs.pathExists(path.join(projectPath, 'src', 'libs')))) {
      throw new Error(`No src/libs directory found in ${projectPath} — is this a nutin project?`);
    }
  }

  async applyFeatureTemplate(projectPath, feature, context) {
    const featureTemplateDir = path.join(__dirname, '..', '..', '..', 'templates', 'features', feature.key);

    await this.fileGenerator.processTemplateDirectory(featureTemplateDir, projectPath, context, { skipExisting: true });

    if (feature.key === 'accessibilityComponents' || feature.key === 'forms' || feature.key === 'overlays') {
      await ensureScssConfigFile(this.fileGenerator, projectPath, context);
    }
    if (feature.key === 'testinNutin') {
      await ensureTestinNutinConfigBlock(path.join(projectPath, nutinConfigFileName));
    }

    await updateLibBarrels(projectPath, feature);
    await updatePackageJson(projectPath, feature, context);
  }

  async runPostAddTasks(projectPath, feature, context) {
    if (feature.key === 'forms' || feature.key === 'overlays') {
      print.warn(`\naccessibilityComponents required by ${feature.key}, installing now...`)
      await this.addFeatureToProject('accessibilityComponents');
    }

    await updateProjectMeta(projectPath, {
      version: PACKAGE_VERSION,
      packageManager: context.packageManager,
      features: { [feature.key]: true },
    });
  }
}

export const featureAdder = new FeatureAdder();

export async function addFeatureToProject(featureKey) {
  return featureAdder.addFeatureToProject(featureKey);
}
