import path from 'path';
import * as fsExtra from 'fs-extra';
import { print } from './print.mjs';
import { initializeGit } from './git-manager.mjs';
import { installDependencies } from './package-manager.mjs';
import { FileGenerator } from './file-generator.mjs';
import { ContextBuilder } from './context-builder.mjs';

const fs = fsExtra.default;

export class ProjectGenerator {
  constructor() {
    this.generator = new FileGenerator();
    this.builder = new ContextBuilder();
  }

	async createProject(answers) {
    const { projectName } = answers;
    const projectPath = path.join(process.cwd(), projectName);
    const context = this.builder.buildContext(answers);

    await this.validateProjectPath(projectPath, projectName);
    await this.setupProjectStructure(projectPath, context);
    await this.runPostSetupTasks(projectPath, context);
  }

  async validateProjectPath(projectPath, projectName) {
    if (await fs.pathExists(projectPath)) {
      throw new Error(`Directory ${projectName} already exists`);
    }
  }

  async setupProjectStructure(projectPath, context) {
    print.boldHead(`\n📁 Creating project in ${projectPath}...`);
    
    await fs.ensureDir(projectPath);
    await this.generator.generateProjectFromTemplates(projectPath, context);
  }

  async runPostSetupTasks(projectPath, context) {
    await this.generator.generateJsonFiles(projectPath, context);
    await initializeGit(projectPath);
    
    await installDependencies(projectPath, context.packageManager);

    await this.runSetupScripts(projectPath, context);
  }

  async runSetupScripts(projectPath, context) {
    print.section('⚙️ Running setup scripts...');
    
    try {
      const setupScriptsTemplate = path.join(__dirname, '..', '..', 'templates', 'scripts');
      
      if (await fs.pathExists(setupScriptsTemplate)) {
        const scriptsDir = path.join(projectPath, 'scripts');
        
        await fs.ensureDir(scriptsDir);
        await this.generator.processTemplateDirectory(setupScriptsTemplate, scriptsDir, context);
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