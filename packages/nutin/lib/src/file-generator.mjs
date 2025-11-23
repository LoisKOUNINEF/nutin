import path from 'path';
import { fileURLToPath } from 'url';
import * as fsExtra from 'fs-extra';
import { TemplateCompiler } from './template-compiler.mjs';
import { print } from './print.mjs';

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

  async generateProjectFromTemplates(projectPath, context) {
    const templateDir = this.getTemplateDirectory();
    
    print.section('📝 Processing templates...');
    await this.processTemplateDirectory(templateDir, projectPath, context);
    
    await this.processFeatureTemplates(projectPath, context);
  }

  getTemplateDirectory() {
    return path.join(__dirname, '..', '..', 'templates', 'base');
  }

  async processTemplateDirectory(templateDir, outputDir, context) {
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
        await this.processTemplateDirectory(templatePath, outputPath, context);
      } else {
        await this.processTemplateFile(templatePath, outputDir, entry.name, context);
      }
    }
  }

  async processFeatureTemplates(projectPath, context) {
    const featuresDir = path.join(__dirname, '..', '..', 'templates', 'features');
    
    if (!(await fs.pathExists(featuresDir))) {
      return;
    }

    const features = [ 'template', 'i18n', 'stylinNutin', 'testinNutin' ];
    
    for (const feature of features) {
      if (context[feature]) {
        const featureTemplateDir = path.join(featuresDir, feature);
        
        if (await fs.pathExists(featureTemplateDir)) {
          print.info(`🔧 Adding ${feature} feature...`);
          await this.processTemplateDirectory(featureTemplateDir, projectPath, context);
        }
      }
    }
  }

  async processTemplateFile(templatePath, outputDir, fileName, context) {
    if (fileName.includes("test.js") && !(context.testinNutin)) {
      return;
    }

    const fileExt = path.extname(fileName).toLowerCase();
    
    if (BINARY_EXTENSIONS.has(fileExt)) {
      const outputPath = path.join(outputDir, fileName);
      await fs.copy(templatePath, outputPath);
      // print.info(`📄 Copied: ${fileName}`);
    } else if (fileName.endsWith('.hbs')) {

      const outputFileName = fileName.replace('.hbs', '');
      const outputPath = path.join(outputDir, outputFileName);
      
      try {
        const compiledContent = await this.compiler.compileFile(templatePath, context);
        await fs.writeFile(outputPath, compiledContent);
        // print.info(`📝 Generated: ${outputFileName}`);
      } catch (error) {
        print.boldError(`❌ Failed to process template: ${fileName}`);
        throw error;
      }
    } else {
      const outputPath = path.join(outputDir, fileName);
      await fs.copy(templatePath, outputPath);
      // print.info(`📄 Copied: ${fileName}`);
    }
  }
}
