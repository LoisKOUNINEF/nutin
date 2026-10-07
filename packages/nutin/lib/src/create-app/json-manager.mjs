import path from 'path';
import * as fsExtra from 'fs-extra';
import { getAllScripts } from '../common/package-json-helper.mjs';

const fs = fsExtra.default;

export class JsonManager {
  async generateJsonFiles(projectPath, context) {
    await this.generatePackageJson(projectPath, context);
    if (context.lang !== 'js') await this.generateTsconfigJson(projectPath);
  }

  async generatePackageJson(projectPath, context) {
    await fs.writeJSON(path.join(projectPath, 'package.json'), this.buildPackageJson(context), { spaces: 2 });
  }

  async generateTsconfigJson(projectPath) {
    await fs.writeJSON(path.join(projectPath, 'tsconfig.json'), this.buildTsconfigJson(), { spaces: 2 });
  }

  // Also used by nutin-update to compare an existing project's files with the current defaults.
  buildPackageJson(context) {
    const { projectName, lang } = context;

    const devDependencies = {
      "chokidar": "^5.0.0",
      "esbuild": "^0.28.2",
      "html-minifier-terser": "^7.2.0",
      "jsdom": "^30.1.1",
      "linkedom": "^0.18.13",
      "sass": "^1.89.0",
      ...(lang === 'js' ? {} : { "typescript": "^7.0.2" })
    };

    const scripts = getAllScripts(context);

    return {
      "name": projectName,
      "version": "0.1.0",
      "type": "module",
      "imports": {
        "#root/*.js": "./*.js"
      },
      scripts,
      devDependencies,
      "engines": {
        "node": ">=24"
      }
    };
  }

  buildTsconfigJson() {
    return {
      "compilerOptions": {
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
      "include": ["src/app", "src/core"],
      "exclude": ["node_modules"]
    };
  }
}
