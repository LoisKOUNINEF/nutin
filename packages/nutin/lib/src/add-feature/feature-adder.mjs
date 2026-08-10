import path from 'path';
import { fileURLToPath } from 'url';
import * as fsExtra from 'fs-extra';
import { print } from '../utils/print.mjs';
import { FileGenerator } from '../common/file-generator.mjs';
import { FEATURES } from '../common/feature-registry.mjs';
import { PACKAGE_VERSION } from '../common/package-data.mjs';
import { readProjectMeta, updateProjectMeta } from '../common/project-meta.mjs';
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

    const meta = await readProjectMeta(projectPath);
    if (meta?.features?.[feature.key]) {
      print.warn(`\n${feature.key} is already enabled in this project — skipping.`);
      return;
    }

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

    const needsAccessibilityComponents = feature.key === 'forms' || feature.key === 'overlays';
    const needsnutinMixins = feature.key === 'accessibilityComponents' || needsAccessibilityComponents;

    if (needsnutinMixins) {
      await ensureScssConfigFile(this.fileGenerator, projectPath, context);
      print.info(`\nnutinMixins required by ${feature.key}, installing now...`);
      await this.addFeatureToProject('nutinMixins');
    }
    if (needsAccessibilityComponents) {
      print.info(`\naccessibilityComponents required by ${feature.key}, installing now...`);
      await this.addFeatureToProject('accessibilityComponents');
    }
    if (feature.key === 'testinNutin') {
      await ensureTestinNutinConfigBlock(path.join(projectPath, nutinConfigFileName));
      await this.backfillTestFiles(projectPath, context);
    }

    await updateLibBarrels(projectPath, feature);
    await updatePackageJson(projectPath, feature, context);
  }

  async backfillTestFiles(projectPath, context) {
    const templatesRoot = path.join(__dirname, '..', '..', '..', 'templates');

    const dirsToRescan = [path.join(templatesRoot, 'base')];
    for (const other of FEATURES) {
      if (other.key === 'testinNutin' || !context[other.key]) continue;
      dirsToRescan.push(path.join(templatesRoot, 'features', other.key));
    }

    for (const dir of dirsToRescan) {
      if (await fs.pathExists(dir)) {
        await this.fileGenerator.processTemplateDirectory(dir, projectPath, context, { skipExisting: true });
      }
    }
  }

  async runPostAddTasks(projectPath, feature, context) {
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
