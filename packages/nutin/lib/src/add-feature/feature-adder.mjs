import path from 'path';
import * as fsExtra from 'fs-extra';
import inquirer from 'inquirer';
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
import { getWorkingTreeStatus, printUndoHint, dirtyTreeError, noGitWarning } from '../common/git.mjs';
import { createProjectWriter } from '../common/project-writer.mjs';

const fs = fsExtra.default;

export class FeatureAdder {
  constructor() {
    this.fileGenerator = new FileGenerator();
    this.builder = new FeatureContextBuilder();
  }

  async addFeatureToProject(featureKey, options = {}) {
    // The command (index.mjs) validates what the user typed: an unknown key here is a bug in the caller.
    const feature = FEATURES.find((candidate) => candidate.key === featureKey);
    if (!feature) throw new Error(`Unknown feature: ${featureKey}`);

    const projectPath = process.cwd();
    await this.validateProject(projectPath);

    const meta = await readProjectMeta(projectPath);
    if (meta?.extension && EXTENSION_INCOMPATIBLE_FEATURES[feature.key]) {
      throw new UserError(`${feature.key} can't be added to a browser extension project: ${EXTENSION_INCOMPATIBLE_FEATURES[feature.key]}.`);
    }
    if (this.isAlreadyEnabled(meta, feature)) return;

    await this.addFeatures(projectPath, [feature], options);
  }

  // nutin-add all: every feature the project can have.
  async addAllFeatures(options = {}) {
    const projectPath = process.cwd();
    await this.validateProject(projectPath);

    const meta = await readProjectMeta(projectPath);
    const compatible = FEATURES.filter((feature) => !(meta?.extension && EXTENSION_INCOMPATIBLE_FEATURES[feature.key]));
    if (compatible.length === 0) {
      print.gray('No feature can be added to a browser extension project: there is nothing to do.');
      return;
    }
    const features = compatible.filter((feature) => !this.isAlreadyEnabled(meta, feature));
    if (features.length === 0) return;

    await this.addFeatures(projectPath, features, options);
  }

  isAlreadyEnabled(meta, feature) {
    if (!meta?.features?.[feature.key]) return false;
    print.gray(`${feature.key} is already enabled in this project — skipping.`);
    return true;
  }

  // The git check runs once, before anything is written (building the context can write .nutin-meta.json).
  // One writer for every feature: with --dry-run, each one sees what the ones before it would write.
  async addFeatures(projectPath, features, options) {
    const writer = createProjectWriter({ dryRun: Boolean(options.dryRun) });
    const undoable = await this.checkUndoable(projectPath, features, options);
    if (undoable === null) return;

    for (const feature of features) {
      await this.addOne(projectPath, feature, writer);
    }

    if (writer.dryRun) writer.printPlan(projectPath);
    else if (undoable) printUndoHint('change');
  }

  // true: the project folder is committed, so the undo command reverts exactly what nutin-add writes.
  // false: go on, without the undo command (dirty tree with --allow-dirty, or no git and confirmed / --yes).
  // null: stop, nothing written. A dirty tree throws without --allow-dirty, as in nutin-update.
  // --dry-run never stops here: it says when a real run would, and never asks.
  async checkUndoable(projectPath, features, { yes = false, allowDirty = false, dryRun = false } = {}) {
    const status = await getWorkingTreeStatus(projectPath);
    const action = `adding ${features.map((feature) => feature.key).join(' and ')}`;
    if (status.repo) {
      if (status.changes.length === 0) return true;
      if (allowDirty) return false;
      const error = dirtyTreeError(action, status.changes);
      if (!dryRun) throw error;
      print.warn(`⚠️  A real run would stop here: ${error.message}`);
      return false;
    }

    print.warn(noGitWarning(status, action));
    if (yes || dryRun) return false;

    // inquirer can't prompt without a TTY: it throws on a closed stdin and waits forever on an open pipe.
    if (!process.stdin.isTTY) {
      print.warn('Non-interactive shell detected — skipping the confirmation prompt.');
      print.boldInfo('Re-run with --yes to add it anyway. No files were changed.');
      return null;
    }

    const { proceed } = await inquirer.prompt([
      { type: 'confirm', name: 'proceed', message: 'Continue anyway?', default: false },
    ]);
    if (!proceed) {
      print.boldError('Aborted — no files were changed.');
      return null;
    }
    return false;
  }

  async addOne(projectPath, feature, writer) {
    print.boldInfo(`\n${writer.dryRun ? 'Dry run: adding' : 'Adding'} ${feature.key} to ${projectPath}...`);

    const context = await this.builder.buildContext(projectPath, feature, writer);

    await this.applyFeatureTemplate(projectPath, feature, context, writer);
    await this.runPostAddTasks(projectPath, feature, context, writer);

    if (writer.dryRun) {
      print.boldInfo(`${feature.key} would be added.`);
      return;
    }
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

  async applyFeatureTemplate(projectPath, feature, context, writer) {
    const featureTemplateDir = path.join(this.fileGenerator.getTemplatesRoot(), 'features', feature.key);

    const skipped = [];
    await this.fileGenerator.processTemplateDirectory(featureTemplateDir, projectPath, context, { skipExisting: true, skipped, writer });
    if (skipped.length > 0) {
      print.gray(`Kept ${skipped.length} file(s) that already exist${isDebug() ? '' : ' (--debug lists them)'}.`);
    }

    await updatePackageJson(projectPath, feature, writer);
    await updateNutinConfig(projectPath, feature, writer);
    await patchBaseTemplates(projectPath, feature, context, this.fileGenerator, writer);
  }

  async runPostAddTasks(projectPath, feature, context, writer) {
    await updateProjectMeta(projectPath, {
      version: PACKAGE_VERSION,
      packageManager: context.packageManager,
      features: { [feature.key]: true },
    }, writer);
    // No feature adds dependencies here.
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

export async function addFeatureToProject(featureKey, options = {}) {
  return featureAdder.addFeatureToProject(featureKey, options);
}

export async function addAllFeatures(options = {}) {
  return featureAdder.addAllFeatures(options);
}
