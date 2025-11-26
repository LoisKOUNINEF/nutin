import path from 'path';
import * as fsExtra from 'fs-extra';
import { print } from './print.mjs';
import { initializeGit } from './git-manager.mjs';
import { installDependencies } from './package-manager.mjs';
import { FileGenerator } from './file-generator.mjs';
import { JsonGenerator } from './json-generator.mjs';
import { ContextBuilder } from './context-builder.mjs';

const fs = fsExtra.default;

export class ProjectGenerator {
  constructor() {
    this.fileGenerator = new FileGenerator();
    this.jsonGenerator = new JsonGenerator();
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
    print.boldHead(`\n📁 Creating project in ${projectPath}...\n`);
    
    await fs.ensureDir(projectPath);
    await this.fileGenerator.generateProjectFromTemplates(projectPath, context);
  }

  async runPostSetupTasks(projectPath, context) {
    await this.jsonGenerator.generateJsonFiles(projectPath, context);
    await initializeGit(projectPath);    
    await installDependencies(projectPath, context.packageManager);
  }
}

export const projectGenerator = new ProjectGenerator();

export async function createProject(answers) {
  return projectGenerator.createProject(answers);
}