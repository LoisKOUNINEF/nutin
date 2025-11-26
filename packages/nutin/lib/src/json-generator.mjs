import path from 'path';
import * as fsExtra from 'fs-extra';
import { generatePackageJson, generateTsconfigJson } from './package-manager.mjs';

const fs = fsExtra.default;

export class JsonGenerator {
  async generateJsonFiles(projectPath, context) {
    await generatePackageJson(projectPath, context);
    await generateTsconfigJson(projectPath, context);
    this.generateConfigFiles(projectPath, context);
  }

  async generateConfigFiles(projectPath, context) {
    const configPath = path.join(projectPath, 'config');
    
    if (context.i18n) {
      await fs.ensureDir(configPath); 
      await this.generateLanguageConfig(configPath);
    }
  }

  async generateLanguageConfig(configPath) {
    const languages = {
      "languages": [ "en" ],
      "defaultLanguage": "en"
    };

    await fs.writeJSON(path.join(configPath, 'languages.json'), languages, { spaces: 2 });    
  }
}