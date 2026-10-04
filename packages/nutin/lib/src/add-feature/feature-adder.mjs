import path from 'path';
import * as fsExtra from 'fs-extra';
import { print } from '../utils/print.mjs';
import { FileGenerator } from '../common/file-generator.mjs';
import { FEATURES } from '../common/feature-registry.mjs';
import { PACKAGE_VERSION } from '../common/package-data.mjs';
import { readProjectMeta, updateProjectMeta } from '../common/project-meta.mjs';
import { FeatureContextBuilder } from './feature-context-builder.mjs';
import { updatePackageJson } from './package-json-updater.mjs';
import { updateNutinConfig } from './nutin-config-updater.mjs';
import { patchBaseTemplates } from './base-template-patcher.mjs';

const fs = fsExtra.default;

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
    await this.validateProject(projectPath);

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
    this.printNextSteps(feature, context);
  }

  async validateProject(projectPath) {
    const packageJsonPath = path.join(projectPath, 'package.json');
    if (!(await fs.pathExists(packageJsonPath))) {
      throw new Error(`No package.json found in ${projectPath} — run this from a nutin project's root.`);
    }
    if (!(await fs.pathExists(path.join(projectPath, 'nutin.config.js')))) {
      throw new Error(`No nutin.config.js file found in ${projectPath} — is this a nutin project?`);
    }
  }

  async applyFeatureTemplate(projectPath, feature, context) {
    const featureTemplateDir = path.join(this.fileGenerator.getTemplatesRoot(), 'features', feature.key);

    await this.fileGenerator.processTemplateDirectory(featureTemplateDir, projectPath, context, { skipExisting: true });

    await updatePackageJson(projectPath, feature);
    await updateNutinConfig(projectPath, feature);
    await patchBaseTemplates(projectPath, feature, context, this.fileGenerator);
  }

  async runPostAddTasks(projectPath, feature, context) {
    await updateProjectMeta(projectPath, {
      version: PACKAGE_VERSION,
      packageManager: context.packageManager,
      features: { [feature.key]: true },
    });
    // No feature adds dependencies here: markdown's are installed by its first build
    // (tools/utils/ensure-deps.js), docker has none.
  }

  printNextSteps(feature, context) {
    if (feature.key === 'docker') {
      print.info('\nNext steps:');
      print.gray('  Edit dockerPorts in nutin.config.js.');
    }
    if (feature.key === 'markdown') {
      print.info('\nNext steps:');
      print.gray('  1. List your Markdown folders in nutin.config.js "markdownSources.sourceFolders" — each one is served at /<folder name>. (Start with the generated default markdown-content).');
      print.gray(`  2. Run "${context.packageManager} run build" — you will be asked to install marked and gray-matter (pass "-- -y" to accept non-interactively).`);  
    }
  }
}

export const featureAdder = new FeatureAdder();

export async function addFeatureToProject(featureKey) {
  return featureAdder.addFeatureToProject(featureKey);
}
