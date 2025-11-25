import { promiseExec } from './utils.mjs';
import { print } from './print.mjs';
import * as fsExtra from 'fs-extra';
import * as path from 'path';

const fs = fsExtra.default;

export async function installDependencies(projectPath, packageManager) {
  print.section(`📦 Installing dependencies with ${packageManager}...`);
  
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

function getScripts(context) {
  const { testinNutin, packageManager, projectName, deployHelper } = context;

  const baseScripts = {
    "build": "node tools/builder/builder.js",
    "build:prod": "NODE_ENV=production node tools/builder/builder.js",
    "serve:only": "node tools/dev/serve.js",
    "serve": `${packageManager} run build && ${packageManager} run serve:only`,
    "dev": "node tools/dev/dev-serve.js",
    "generate": "node tools/generator/generator.js"
  };

  const deployHelperScripts = {
    "docker:build": `docker build -t ${projectName} -f tools/deployment/Dockerfile .`,
    "docker:run": `docker run -p 9090:9090 ${projectName}:latest`,
    "patch": `${packageManager} version patch -m 'CI/CD: Bump version to %s'`,
    "minor": `${packageManager} version minor -m 'CI/CD: Bump version to %s'`,
    "major": `${packageManager} version major -m 'CI/CD: Bump version to %s'`
  }

  const testinNutinScripts = {
    "test": "node testin-nutin/runner.js",
    "test:rebuild": `${packageManager} run build && ${packageManager} run test`,
    "test:watch": `${packageManager} run build && node testin-nutin/watch-tests.js`
  }

  let scripts = { ...baseScripts };

  if (testinNutin) scripts = { ...scripts, ...testinNutinScripts };
  if (deployHelper) scripts = { ...scripts, ...deployHelperScripts };

  return scripts;
}

export async function generatePackageJson(projectPath, context) {
  const { testinNutin, projectName } = context;

  const devDependencies = {
    "chokidar": "^4.0.3",
    "esbuild": "^0.25.12",
    "html-minifier-terser": "^7.2.0",
    "live-server": "^1.2.2",
    "sass": "^1.89.0",
    "typescript": "^5.8.3",
    ...(testinNutin && {
      "jsdom": "^26.1.0",
    })
  };

  const scripts = getScripts(context);

  const packageJson = {
    "name": projectName,
    "version": "0.1.0",
    "type": "module",
    ...(testinNutin && {
      "imports": {
        "#root/*.js": "./*.js"
      }
    }),
    scripts,
    devDependencies,
    ...(testinNutin && {
      "engines": {
        "node": ">=20.19.0"
      }
    })
  };
  
  await fs.writeJSON(path.join(projectPath, 'package.json'), packageJson, { spaces: 2 });
}

export async function generateTsconfigJson(projectPath, context) {
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
