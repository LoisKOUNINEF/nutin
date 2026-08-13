import path from 'path';
import { fileURLToPath } from 'url';
import * as fsExtra from 'fs-extra';
import { TemplateCompiler } from './template-compiler.mjs';
import { print } from '../utils/print.mjs';
import { FEATURES } from './feature-registry.mjs';

const fs = fsExtra.default;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BINARY_EXTENSIONS = new Set([
  '.png', '.jpg', '.jpeg', '.gif', '.webp', '.avif', '.svg',
  '.ico', '.woff', '.woff2', '.ttf', '.otf', '.eot',
  '.mp4', '.webm', '.mp3', '.wav', '.ogg',
  '.pdf', '.zip', '.tar', '.gz'
]);

export class FileGenerator {
  constructor() {
    this.compiler = new TemplateCompiler();
  }

  async generateProjectFromTemplates(projectPath, context, templatesRoot = this.getTemplatesRoot()) {
    const templateDir = path.join(templatesRoot, 'base');

    print.section('📝 Processing templates...');
    await this.processTemplateDirectory(templateDir, projectPath, context);

    await this.processFeatureTemplates(projectPath, context, templatesRoot);
  }

  getTemplatesRoot() {
    return path.join(__dirname, '..', '..', '..', 'templates');
  }

  async processTemplateDirectory(templateDir, outputDir, context, options = {}) {
    if (!(await fs.pathExists(templateDir))) {
      throw new Error(`Template directory not found: ${templateDir}`);
    }

    const entries = await fs.readdir(templateDir, { withFileTypes: true });

    for (const entry of entries) {
      if (entry.name === '.DS_Store') continue;

      const templatePath = path.join(templateDir, entry.name);

      if (entry.isDirectory()) {
        const outputPath = path.join(outputDir, entry.name);
        await fs.ensureDir(outputPath);
        await this.processTemplateDirectory(templatePath, outputPath, context, options);
      } else {
        await this.processTemplateFile(templatePath, outputDir, entry.name, context, options);
      }
    }
  }

  async processFeatureTemplates(projectPath, context, templatesRoot = this.getTemplatesRoot()) {
    const featuresDir = path.join(templatesRoot, 'features');

    if (!(await fs.pathExists(featuresDir))) {
      return;
    }

    for (const feature of FEATURES) {
      if (context[feature.key]) {
        const featureTemplateDir = path.join(featuresDir, feature.key);

        if (await fs.pathExists(featureTemplateDir)) {
          print.info(`Adding ${feature.key} feature...`);
          await this.processTemplateDirectory(featureTemplateDir, projectPath, context);
        }
      }
    }
  }

  async isRenderTemplateFile(templatePath, fileName, context) {
    if (/^_nutin-config\.scss(\.hbs)?$/.test(fileName) && !(context.accessibilityComponents || context.forms || context.overlays)) {
      return null;
    }

    const fileExt = path.extname(fileName).toLowerCase();
    const outputFileName = fileName.endsWith('.hbs') ? fileName.replace('.hbs', '') : fileName;
    const isBinary = BINARY_EXTENSIONS.has(fileExt);

    let content;
    if (isBinary) {
      content = await fs.readFile(templatePath);
    } else if (fileName.endsWith('.hbs')) {
      content = await this.compiler.compileFile(templatePath, context);
    } else {
      content = await fs.readFile(templatePath, 'utf8');
    }

    return { outputFileName, isBinary, content };
  }

  async processTemplateFile(templatePath, outputDir, fileName, context, options = {}) {
    let rendered;
    try {
      rendered = await this.isRenderTemplateFile(templatePath, fileName, context);
    } catch (error) {
      print.boldError(`❌ Failed to process template: ${fileName}`);
      throw error;
    }

    if (!rendered) {
      return;
    }

    const outputPath = path.join(outputDir, rendered.outputFileName);

    if (options.skipExisting && await fs.pathExists(outputPath)) {
      print.gray(`Skipped (already exists): ${path.relative(outputDir, outputPath)}`);
      return;
    }

    await fs.writeFile(outputPath, rendered.content);
  }

  async collectTemplateTree(templatesRoot, context) {
    const result = new Map();

    const baseDir = path.join(templatesRoot, 'base');
    if (await fs.pathExists(baseDir)) {
      await this.collectTemplateDirectory(baseDir, baseDir, context, result);
    }

    const featuresDir = path.join(templatesRoot, 'features');
    for (const feature of FEATURES) {
      if (!context[feature.key]) continue;

      const featureDir = path.join(featuresDir, feature.key);
      if (await fs.pathExists(featureDir)) {
        await this.collectTemplateDirectory(featureDir, featureDir, context, result);
      }
    }

    return result;
  }

  async collectTemplateDirectory(dir, baseDir, context, result) {
    const entries = await fs.readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      if (entry.name === '.DS_Store') continue;

      const entryPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        await this.collectTemplateDirectory(entryPath, baseDir, context, result);
      } else {
        const rendered = await this.isRenderTemplateFile(entryPath, entry.name, context);
        if (!rendered) continue;

        const relativeDir = path.relative(baseDir, dir);
        const relativeOutputPath = path.join(relativeDir, rendered.outputFileName);
        result.set(relativeOutputPath, { content: rendered.content, isBinary: rendered.isBinary });
      }
    }
  }
}
