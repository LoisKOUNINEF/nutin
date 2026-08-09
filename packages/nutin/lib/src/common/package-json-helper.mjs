import { promiseExec } from '../utils/promise-exec-alias.mjs';
import { print } from '../utils/print.mjs';
import * as fsExtra from 'fs-extra';
import * as path from 'path';

const fs = fsExtra.default;

export async function detectPackageManager(projectPath) {
  if (await fs.pathExists(path.join(projectPath, 'pnpm-lock.yaml'))) return 'pnpm';
  if (await fs.pathExists(path.join(projectPath, 'yarn.lock'))) return 'yarn';
  if (await fs.pathExists(path.join(projectPath, 'bun.lockb'))) return 'bun';
  return 'npm';
}

export async function installDependencies(projectPath, packageManager) {
  print.section(`📦 Installing dependencies with ${packageManager}...`);
  
  const installCommand = getInstallCommand(packageManager);
  await promiseExec(installCommand, { cwd: projectPath, maxBuffer: 1024 * 1024 * 10 });
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

export function getInstallCommand(packageManager) {
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

export function getDeployHelperScripts({ projectName, packageManager }) {
  return {
    "docker:build": `docker build -t ${projectName} -f tools/deployment/Dockerfile .`,
    "docker:run": `docker run -p 9090:9090 ${projectName}:latest`,
    "patch": `${packageManager} version patch -m 'CI/CD: Bump version to %s'`,
    "minor": `${packageManager} version minor -m 'CI/CD: Bump version to %s'`,
    "major": `${packageManager} version major -m 'CI/CD: Bump version to %s'`
  };
}

export function getTestinNutinScripts({ packageManager }) {
  return {
    "test": "node testin-nutin/runner.js",
    "test:rebuild": `${packageManager} run build && ${packageManager} run test`,
    "test:watch": `${packageManager} run build && node testin-nutin/watch-tests.js`
  };
}

export function getTestinNutinExtras() {
  return {
    devDependencies: { "jsdom": "^26.1.0" },
    imports: { "#root/*.js": "./*.js" },
    engines: { "node": ">=20.19.0" }
  };
}

export function getAllScripts(context) {
  const { testinNutin, packageManager, projectName, deployHelper } = context;

  const baseScripts = {
    "build": "node tools/builder/builder.js",
    "build:prod": "NODE_ENV=production node tools/builder/builder.js",
    "serve:only": "node tools/dev/serve.js",
    "serve": `${packageManager} run build && ${packageManager} run serve:only`,
    "dev": "node tools/dev/dev-serve.js",
    "generate": "node tools/generator/generator.js"
  };

  let scripts = { ...baseScripts };

  if (testinNutin) scripts = { ...scripts, ...getTestinNutinScripts({ packageManager }) };
  if (deployHelper) scripts = { ...scripts, ...getDeployHelperScripts({ projectName, packageManager }) };

  return scripts;
}
