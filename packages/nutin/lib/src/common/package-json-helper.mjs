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

export function getDockerScripts({ projectName, packageManager }) {
  return {
    "docker:build": `docker build -t ${projectName} -f tools/deployment/Dockerfile .`,
    "docker:run": `docker run -p 9090:9090 ${projectName}:latest`,
    "patch": `${packageManager} version patch -m 'CI/CD: Bump version to %s'`,
    "minor": `${packageManager} version minor -m 'CI/CD: Bump version to %s'`,
    "major": `${packageManager} version major -m 'CI/CD: Bump version to %s'`
  };
}

export function getAllScripts(context) {
  const { packageManager, projectName, docker } = context;

  const baseScripts = {
    "build": "node tools/builder/builder.js",
    "build:prod": "NODE_ENV=production node tools/builder/builder.js",
    "serve": `${packageManager} run build && ${packageManager} run serve:only`,
    "serve:only": "node tools/dev/serve.js",
    "dev": "node tools/dev/dev-serve.js",
    "generate": "node tools/generator/generator.js",
    "testin-nutin": `${packageManager} run build && node tools/testin-nutin/runner.js`,
    "testin-nutin:watch": `${packageManager} run build && node tools/testin-nutin/watch-tests.js`,
    "testin-nutin:only": `node tools/testin-nutin/runner.js`
  };

  let scripts = { ...baseScripts };

  if (docker) scripts = { ...scripts, ...getDockerScripts({ projectName, packageManager }) };

  return scripts;
}
