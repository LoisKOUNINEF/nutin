import { promiseExec } from './utils.mjs';
import { print } from './print.mjs';
import * as fsExtra from 'fs-extra';
import * as path from 'path';

const fs = fsExtra.default;

export async function installDependencies(projectPath, packageManager) {
  print.section(`\n📦 Installing dependencies with ${packageManager}...`);
  
  const installCommand = getInstallCommand(packageManager);
  await promiseExec(installCommand, { cwd: projectPath });
}

export function getInstallCommand(packageManager) {
  switch (packageManager) {
    case 'yarn':
      return 'yarn install';
    case 'pnpm':
      return 'pnpm install';
    default:
      return 'npm install';
  }
}

export async function generatePackageJson(projectPath, answers) {
  const { testinNutin, projectName, template } = answers;

  const baseDevDeps = {
    "concurrently": "^9.1.2",
    "live-server": "^1.2.2",
    "sass": "^1.89.0",
    "typescript": "^5.8.3"
  }; 

  const devDependencies = testinNutin 
    ? { ...baseDevDeps, "jsdom": "^26.1.0" } 
    : baseDevDeps;

  const baseScripts = {
    "patch": "npm version patch -m 'CI/CD: Bump version to %s'",
    "minor": "npm version minor -m 'CI/CD: Bump version to %s'",
    "major": "npm version major -m 'CI/CD: Bump version to %s'",
    "build:ts": "tsc --project tsconfig.json",
    "build-static": "node tools/builder/builder.js",
    "serve": "npm run build && live-server dist/src --port=9090 --entry-file=index.html",
    "generate": "node tools/generator/generator.js"
  }

  let scripts = testinNutin
    ? {
      ...baseScripts,
      "test": "node test/runner.js",
      "test--rebuild": "npm run build && npm run test",
      "test:watch": "npm run build && node test/watch-tests.js"
    }
    : baseScripts;

  scripts = template
    ? {
      ...scripts,
      "build:clear": "rm -rf dist/src/* dist-build",
      "build:finalize": "mkdir -p dist && mv dist-build/src dist/ && rm -rf dist-build",
      "build": "npm run build:clear && npm run build:ts && npm run build-static && npm run build:finalize",
      "serve:only": "live-server dist/src --port=9090 --entry-file=index.html --open",
      "serve": "npm run build && npm run serve:only",
      "dev": "concurrently \"node tools/watcher.js\" \"npm run build && npm run serve:only > /dev/null 2>&1\"",
    }
    : {
      ...scripts,
      "build:clear": "rm -rf dist",
      "build": "npm run build:clear && npm run build:ts && npm run build-static",
      "dev": "concurrently \"npm run watch\" \"npm run serve\"",
      "watch:ts": "tsc --watch",
      "watch:sass": "sass --watch src/styles:dist/css",
      "watch": "concurrently \"npm:watch:*\""
    };

  const packageJson = {
    "name": projectName,
    "version": "0.1.0",
    "main": "index.js",
    "type": "module",
    "imports": testinNutin ? {
      "#root/*.js": "./*.js"
    } : {},
    scripts,
    devDependencies
  };
  
  await fs.writeJSON(path.join(projectPath, 'package.json'), packageJson, { spaces: 2 });
}

export async function generateTsconfigJson(projectPath, answers) {
  const { template } = answers;

  const tsconfig = {
      "compilerOptions": {
      "baseUrl": "./",
      "paths": {},
      "target": "ESNext",
      "module": "NodeNext",
      "moduleResolution": "NodeNext",
      "rootDir": ".",
      "outDir": template ? "dist-build" : 'dist',
      "strict": true,
      "esModuleInterop": true,
      "allowSyntheticDefaultImports": true,
      "lib": ["es2022", "DOM"],
      "types": [],
      "resolveJsonModule": true,
      "typeRoots": ["src/types", "node_modules/@types"]
    },
    "include": ["src/app", "src/core", "src/libs"],
    "exclude": ["node_modules"]
  };
  
  await fs.writeJSON(path.join(projectPath, 'tsconfig.json'), tsconfig, { spaces: 2 });
}
