import path from 'path';
import * as fsExtra from 'fs-extra';
import { getAllScripts } from '../common/package-json-helper.mjs';

const fs = fsExtra.default;

export class JsonManager {
  async generateJsonFiles(projectPath, context) {
    await this.generatePackageJson(projectPath, context);
    if (context.lang !== 'js') await this.generateTsconfigJson(projectPath, context);
  }

  async generatePackageJson(projectPath, context) {
    await fs.writeJSON(path.join(projectPath, 'package.json'), this.buildPackageJson(context), { spaces: 2 });
  }

  async generateTsconfigJson(projectPath, context) {
    await fs.writeJSON(path.join(projectPath, 'tsconfig.json'), this.buildTsconfigJson(context), { spaces: 2 });
  }

  // Also used by nutin-update to compare an existing project's files with the current defaults.
  buildPackageJson(context) {
    const { projectName, lang, extension } = context;

    const devDependencies = {
      "chokidar": "^5.0.0",
      "esbuild": "^0.28.2",
      "html-minifier-terser": "^7.2.0",
      "jsdom": "^30.1.1",
      "linkedom": "^0.18.13",
      "sass": "^1.89.0",
      ...(lang === 'js' ? {} : { "typescript": "^7.0.2" }),
      // chrome.* types: Firefox implements the same namespace for most of it.
      ...(extension && lang !== 'js' ? { "@types/chrome": "^0.3.7" } : {}),
      // Mozilla's linter and signing tool (lint:extension, and the release workflow). Exact: a
      // new linter version can fail a release that passed the day before.
      ...(extension ? { "web-ext": "10.8.0" } : {})
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

  buildTsconfigJson(context = {}) {
    const { extension } = context;
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
        "noUnusedLocals": true,
        "noUnusedParameters": true,
        "noImplicitReturns": true,
        "noImplicitOverride": true,
        "noFallthroughCasesInSwitch": true,
        "esModuleInterop": true,
        "allowSyntheticDefaultImports": true,
        "lib": ["es2022", "DOM"],
        "removeComments": true,
        "resolveJsonModule": true,
        // Listing types turns off the automatic inclusion of every other @types package.
        ...(extension ? { "types": ["chrome"] } : {}),
        "typeRoots": ["src/types", "node_modules/@types"]
      },
      "include": ["src/app", "src/core", ...(extension ? ["src/extension"] : [])],
      "exclude": ["node_modules"]
    };
  }
}
