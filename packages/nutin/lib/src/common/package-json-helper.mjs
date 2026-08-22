import { promiseExec } from '../utils/promise-exec-alias.mjs';
import { print } from '../utils/print.mjs';
import * as fsExtra from 'fs-extra';
import * as path from 'path';

const fs = fsExtra.default;

export async function detectPackageManager(projectPath) {
  if (await fs.pathExists(path.join(projectPath, 'pnpm-lock.yaml'))) return 'pnpm';
  if (await fs.pathExists(path.join(projectPath, 'yarn.lock'))) return 'yarn';
  // bun 1.x switched its default lockfile from the binary bun.lockb to a text-based bun.lock —
  // check both since either can be present depending on the bun version that created the project.
  if (await fs.pathExists(path.join(projectPath, 'bun.lock'))) return 'bun';
  if (await fs.pathExists(path.join(projectPath, 'bun.lockb'))) return 'bun';
  return 'npm';
}

export async function installDependencies(projectPath, packageManager) {
  print.section(`📦 Installing dependencies with ${packageManager}...`);

  const installCommand = getInstallCommand(packageManager);
  try {
    await promiseExec(installCommand, { cwd: projectPath, maxBuffer: 1024 * 1024 * 10 });
  } catch (err) {
    const output = `${err.stdout ?? ''}\n${err.stderr ?? ''}`;

    // pnpm >=10 refuses to run devDependency postinstall/build scripts (e.g. esbuild's,
    // chokidar's optional native watcher backends) by default and exits non-zero even though
    // every package installed successfully. Recover by approving them here (writes pnpm-workspace.yaml,
    // which also stops every later `pnpm run <script>` from re-triggering the same check).
    if (packageManager === 'pnpm' && /ERR_PNPM_IGNORED_BUILDS/.test(output)) {
      print.warn('⚠️ pnpm flagged some build scripts as needing approval — approving automatically...');
      try {
        await promiseExec('pnpm approve-builds --all', { cwd: projectPath, maxBuffer: 1024 * 1024 * 10 });
        return;
      } catch (approveErr) {
        print.error(`pnpm approve-builds --all also failed: ${approveErr.message}`);
      }
    }

    if (err.stdout) print.gray(err.stdout);
    if (err.stderr) print.error(err.stderr);
    throw new Error(`${installCommand} failed (see output above for the real cause).`);
  }
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

export function getDockerScripts() {
  const dockerScriptsDir = 'node tools/docker/scripts'
  return {
    "docker:build": `${dockerScriptsDir}/docker-build.js`,
    "docker:run": `${dockerScriptsDir}/docker-run.js`
  };
}

export function getAllScripts(context) {
  const { packageManager, docker } = context;

  const baseScripts = {
    "build": "node tools/builder/builder.js",
    "build:prod": "NODE_ENV=production node tools/builder/builder.js",
    "serve": `${packageManager} run build && ${packageManager} run serve:only`,
    "serve:only": "node tools/dev/serve.js",
    "serve:prod": `${packageManager} run build:prod && ${packageManager} run serve:only`,
    "dev": "node tools/dev/dev-serve.js",
    "generate": "node tools/generator/generator.js",
    "testin-nutin": `${packageManager} run build && node tools/testin-nutin/runner.js`,
    "testin-nutin:watch": `${packageManager} run build && node tools/testin-nutin/watch-tests.js`,
    "testin-nutin:coverage": `${packageManager} run build && node tools/testin-nutin/runner.js --coverage`,
    "testin-nutin:verbose": `${packageManager} run build && node tools/testin-nutin/runner.js --verbose`
  };

  let scripts = { ...baseScripts };

  if (docker) scripts = { ...scripts, ...getDockerScripts() };

  return scripts;
}
