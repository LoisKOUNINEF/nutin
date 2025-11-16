import path from 'path';
import { fileURLToPath } from 'url';
import * as fsExtra from 'fs-extra';
import { TemplateCompiler } from './template-compiler.mjs';
import { print } from './print.mjs';
import { initializeGit } from './git-manager.mjs';
import { installDependencies, generatePackageJson, generateTsconfigJson, getCiCommand } from './package-manager.mjs';
import { packageVersion } from './utils.mjs';

const fs = fsExtra.default;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BINARY_EXTENSIONS = new Set([
  '.png', '.jpg', '.jpeg', '.gif', '.webp', '.avif', '.svg',
  '.ico', '.woff', '.woff2', '.ttf', '.otf', '.eot',
  '.mp4', '.webm', '.mp3', '.wav', '.ogg',
  '.pdf', '.zip', '.tar', '.gz'
]);

export class ProjectGenerator {
  constructor() {
    this.compiler = new TemplateCompiler();
  }

  async createProject(answers) {
    const { projectName } = answers;
    const projectPath = path.join(process.cwd(), projectName);

    await this.validateProjectPath(projectPath, projectName);
    await this.setupProjectStructure(projectPath, answers);
    await this.runPostSetupTasks(projectPath, answers);
  }

  async validateProjectPath(projectPath, projectName) {
    if (await fs.pathExists(projectPath)) {
      throw new Error(`Directory ${projectName} already exists`);
    }
  }

  async setupProjectStructure(projectPath, answers) {
    print.boldHead(`\n📁 Creating project in ${projectPath}...`);
    
    await fs.ensureDir(projectPath);
    await this.generateProjectFromTemplates(projectPath, answers);
  }

  async generateProjectFromTemplates(projectPath, answers) {
    const context = this.buildContext(answers);
    const templateDir = this.getTemplateDirectory(answers);
    
    print.section('📝 Processing templates...');
    await this.processTemplateDirectory(templateDir, projectPath, context);
    
    await this.processFeatureTemplates(projectPath, context);
  }

  buildContext(answers) { 
    const version = packageVersion;
    const ciCommand = getCiCommand(answers.packageManager);

    return {
      projectName: answers.projectName,
      description: answers.description || `A modern web application`,
      
      template: answers.template || false,
      stylinNutin: answers.stylinNutin || false,
      i18n: answers.i18n || false,
      transition: answers.transition || false,
      testinNutin: answers.testinNutin || false,

      hasFeatures: answers.template || answers.stylinNutin || answers.i18n || answers.transition || answers.testinNutin,
      
      year: new Date().getFullYear(),
      packageManager: answers.packageManager || 'npm',
      ciCommand: ciCommand,
      version: version
    };
  }

  getTemplateDirectory(answers) {
    return path.join(__dirname, '../../templates/base');
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

  async processFeatureTemplates(projectPath, context) {
    const featuresDir = path.join(__dirname, '../../templates/features');
    
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

  async generateJsonFiles(projectPath, answers) {
    await generatePackageJson(projectPath, answers);
    await generateTsconfigJson(projectPath, answers);
    if (answers.i18n) this.generateConfigFiles(projectPath);
  }

  async generateConfigFiles(projectPath) {
    const configPath = path.join(projectPath, 'config');
    await fs.ensureDir(configPath);
    const languages = {
      "languages": ["en"],
      "defaultLanguage": "en"
    };

    await fs.writeJSON(path.join(configPath, 'languages.json'), languages, { spaces: 2 });
  }

  async runPostSetupTasks(projectPath, answers) {
    await this.generateJsonFiles(projectPath, answers);
    await initializeGit(projectPath);
    
    await installDependencies(projectPath, answers.packageManager);

    await this.runSetupScripts(projectPath, answers);
  }

  async runSetupScripts(projectPath, answers) {
    print.section('⚙️ Running setup scripts...');
    
    try {
      const setupScriptsTemplate = path.join(__dirname, '..', '..', 'templates', 'scripts');
      
      if (await fs.pathExists(setupScriptsTemplate)) {
        const scriptsDir = path.join(projectPath, 'scripts');
        const context = this.buildContext(answers);
        
        await fs.ensureDir(scriptsDir);
        await this.processTemplateDirectory(setupScriptsTemplate, scriptsDir, context);
      }
    } catch (error) {
      print.boldError('⚠️ Warning: Could not set up build scripts');
      console.error(error);
    }
  }
}

export const projectGenerator = new ProjectGenerator();

export async function createProject(answers) {
  return projectGenerator.createProject(answers);
}
