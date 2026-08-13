import path from 'path';
import * as fsExtra from 'fs-extra';
import { getAllScripts } from '../common/package-json-helper.mjs';

const fs = fsExtra.default;

export class JsonManager {
  async generateJsonFiles(projectPath, context) {
    await this.generatePackageJson(projectPath, context);
    await this.generateTsconfigJson(projectPath, context);
    await this.generateConfigFiles(projectPath, context);
  }

  async generatePackageJson(projectPath, context) {
    const { testinNutin, projectName } = context;

    const devDependencies = {
      "chokidar": "^4.0.3",
      "esbuild": "^0.25.12",
      "html-minifier-terser": "^7.2.0",
      "jsdom": "^26.1.0",
      "linkedom": "^0.18.12",
      "live-server": "^1.2.2",
      "sass": "^1.89.0",
      "typescript": "^5.8.3"
    };

    const scripts = getAllScripts(context);

    const packageJson = {
      "name": projectName,
      "version": "0.1.0",
      "type": "module",
      "imports": {
        "#root/*.js": "./*.js"
      },
      scripts,
      devDependencies,
      "engines": {
        "node": ">=22"
      }
    };
    
    await fs.writeJSON(path.join(projectPath, 'package.json'), packageJson, { spaces: 2 });
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

  async generateTsconfigJson(projectPath) {
    const tsconfig = {
      "compilerOptions": {
        "baseUrl": "./",
        "paths": {},
        "target": "ESNext",
        "module": "NodeNext",
        "moduleResolution": "NodeNext",
        "rootDir": "src",
        "outDir": "dist-build/src",
        "strict": true,
        "skipLibCheck": true,
        "forceConsistentCasingInFileNames": true,
        "noUncheckedIndexedAccess": true,
        "esModuleInterop": true,
        "allowSyntheticDefaultImports": true,
        "lib": ["es2022", "DOM"],
        "removeComments": true,
        "resolveJsonModule": true,
        "typeRoots": ["src/types", "node_modules/@types"]
      },
      "include": ["src/app", "src/core", "src/libs"],
      "exclude": ["node_modules"]
    };
    
    await fs.writeJSON(path.join(projectPath, 'tsconfig.json'), tsconfig, { spaces: 2 });
  }
}
