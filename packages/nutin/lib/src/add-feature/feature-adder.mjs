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
import { EXTENSION_INCOMPATIBLE_FEATURES } from '../common/extension.mjs';
import { runScriptCommand } from '../common/package-json-helper.mjs';
import { UserError, isDebug } from '../utils/errors.mjs';

const fs = fsExtra.default;

export class FeatureAdder {
  constructor() {
    this.fileGenerator = new FileGenerator();
    this.builder = new FeatureContextBuilder();
  }

  async addFeatureToProject(featureKey) {
    // The command (index.mjs) validates what the user typed: an unknown key here is a bug in the caller.
    const feature = FEATURES.find((candidate) => candidate.key === featureKey);
    if (!feature) throw new Error(`Unknown feature: ${featureKey}`);

    const projectPath = process.cwd();
    await this.validateProject(projectPath);

    const meta = await readProjectMeta(projectPath);
    if (meta?.extension && EXTENSION_INCOMPATIBLE_FEATURES[feature.key]) {
      throw new UserError(`${feature.key} can't be added to a browser extension project: ${EXTENSION_INCOMPATIBLE_FEATURES[feature.key]}.`);
    }
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
      throw new UserError(`No package.json found in ${projectPath}.`, { hint: 'Run this from the root folder of a nutin project.' });
    }
    if (!(await fs.pathExists(path.join(projectPath, 'nutin.config.js')))) {
      throw new UserError(`No nutin.config.js found in ${projectPath}: this isn't a nutin project.`, { hint: 'Run this from the root folder of a nutin project.' });
    }
  }

  async applyFeatureTemplate(projectPath, feature, context) {
    const featureTemplateDir = path.join(this.fileGenerator.getTemplatesRoot(), 'features', feature.key);

    const skipped = [];
    await this.fileGenerator.processTemplateDirectory(featureTemplateDir, projectPath, context, { skipExisting: true, skipped });
    if (skipped.length > 0) {
      print.gray(`Kept ${skipped.length} file(s) that already exist${isDebug() ? '' : ' (--debug lists them)'}.`);
    }

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
    const pm = context.packageManager;
    if (feature.key === 'docker') {
      print.info('\nNext steps:');
      print.gray(`  1. Build the image with "${runScriptCommand(pm, 'docker:build')}", then start it with "${runScriptCommand(pm, 'docker:run')}".`);
      print.gray(`  2. "${runScriptCommand(pm, 'docker:run', '--help')}" lists their flags (detached run, tags...).`);
    }
    if (feature.key === 'markdown') {
      print.info('\nNext steps:');
      print.gray('  1. List your Markdown folders in nutin.config.js "markdownSources.sourceFolders": each one is served at /<folder name>. Start from the generated "markdown-content" folder.');
      print.gray(`  2. Run "${runScriptCommand(pm, 'build')}": it asks to install marked and gray-matter ("${runScriptCommand(pm, 'build', '-y')}" installs them without asking).`);
      print.gray(`  3. "${runScriptCommand(pm, 'markdown:check')}" checks the Markdown folders without building.`);
    }
  }
}

export const featureAdder = new FeatureAdder();

export async function addFeatureToProject(featureKey) {
  return featureAdder.addFeatureToProject(featureKey);
}

// nutin-add all: every feature the project can have (an extension can't have any of them).
export async function addAllFeatures() {
  const meta = await readProjectMeta(process.cwd());
  const features = FEATURES.filter((feature) => !(meta?.extension && EXTENSION_INCOMPATIBLE_FEATURES[feature.key]));
  if (features.length === 0) {
    print.gray('No feature can be added to a browser extension project: there is nothing to do.');
    return;
  }
  for (const feature of features) {
    await featureAdder.addFeatureToProject(feature.key);
  }
}
