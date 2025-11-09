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

export function getCiCommand(packageManager) {
  switch (packageManager) {
    case 'yarn':
      return 'yarn install --frozen-lockfile';
    case 'pnpm':
      return 'pnpm install --frozen-lockfile';
    case 'bun':
      return 'bun install --frozen-lockfile'
    default:
      return 'npm ci';
  }
}

function getInstallCommand(packageManager) {
  switch (packageManager) {
    case 'yarn':
      return 'yarn install';
    case 'pnpm':
      return 'pnpm install';
    case 'bun':
      return 'bun install'
    default:
      return 'npm install';
  }
}

function getScripts(answers) {
  const { testinNutin, packageManager } = answers;

  const baseScripts = {
    "patch": `${packageManager} version patch -m 'CI/CD: Bump version to %s'`,
    "minor": `${packageManager} version minor -m 'CI/CD: Bump version to %s'`,
    "major": `${packageManager} version major -m 'CI/CD: Bump version to %s'`,
    "build": "node tools/builder/builder.js",
    "build:prod": "NODE_ENV=production node tools/builder/builder.js",
    "serve:only": "node tools/serve.js",
    "serve": `${packageManager} run build && ${packageManager} run serve:only`,
    "dev": "node tools/dev.js",
    "generate": "node tools/generator/generator.js"
  };

  const testinNutinScripts = {
      "test": "node test/runner.js",
      "test:rebuild": `${packageManager} run build && ${packageManager} run test`,
      "test:watch": `${packageManager} run build && node test/watch-tests.js`,
      "serve": `${packageManager} run build && ${packageManager} run serve:only`
    }

  return testinNutin
    ? {
      ...baseScripts,
      ...testinNutinScripts
    }
    : baseScripts;
}

export async function generatePackageJson(projectPath, answers) {
  const { testinNutin, projectName, packageManager } = answers;

  const devDependencies = {
    "esbuild": "0.25.12",
    "html-minifier-terser": "7.2.0",
    "jsdom": "26.1.0",
    "live-server": "1.2.2",
    "sass": "1.89.0",
    "typescript": "5.8.3"
  };

  const scripts = getScripts(answers);

  const packageJson = {
    "name": projectName,
    "version": "0.1.0",
    "type": "module",
    "imports": testinNutin ? {
      "#root/*.js": "./*.js"
    } : {},
    scripts,
    devDependencies,
    "packageManager": `${packageManager}@latest`
  };
  
  await fs.writeJSON(path.join(projectPath, 'package.json'), packageJson, { spaces: 2 });
}

export async function generateTsconfigJson(projectPath, answers) {
  const tsconfig = {
      "compilerOptions": {
      "baseUrl": "./",
      "paths": {},
      "target": "ESNext",
      "module": "NodeNext",
      "moduleResolution": "NodeNext",
      "rootDir": ".",
      "outDir": "dist-build",
      "strict": true,
      "esModuleInterop": true,
      "allowSyntheticDefaultImports": true,
      "lib": ["es2022", "DOM"],
      "types": [],
      "removeComments": true,
      "resolveJsonModule": true,
      "typeRoots": ["src/types", "node_modules/@types"]
    },
    "include": ["src/app", "src/core", "src/libs"],
    "exclude": ["node_modules"]
  };
  
  await fs.writeJSON(path.join(projectPath, 'tsconfig.json'), tsconfig, { spaces: 2 });
}
