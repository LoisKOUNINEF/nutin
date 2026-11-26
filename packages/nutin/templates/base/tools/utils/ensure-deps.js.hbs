import fs from 'fs';
import path from 'path';
import { print } from './print.js';
import { errorExit } from './error-exit.js';
import { runCommand } from './run-command.js';
import { promptBoolean } from './prompt-boolean.js';

export function isInstalled(depName) {
  return fs.existsSync(path.join(process.cwd(), 'node_modules', depName, 'package.json'));
}

export function detectPackageManager() {
  const has = (file) => fs.existsSync(path.join(process.cwd(), file));
  if (has('pnpm-lock.yaml')) return 'pnpm';
  if (has('yarn.lock')) return 'yarn';
  if (has('bun.lock') || has('bun.lockb')) return 'bun';
  return 'npm';
}

export function getDevInstallArgs(packageManager, deps) {
  const pkgList = deps.map((dep) => `${dep.name}@${dep.version}`);
  return packageManager === 'npm'
    ? ['npm', ['install', '-D', ...pkgList]]
    : [packageManager, ['add', '-D', ...pkgList]];
}

// npm reads flags given without "--" as its own: "npm run build -- -y", but "pnpm run build -y".
export function buildWithYes(packageManager) {
  return packageManager === 'npm' ? 'npm run build -- -y' : `${packageManager} run build -y`;
}

// builder.js forwards -y/--yes through the env, since runScript doesn't forward argv.
function assumeYes() {
  return process.env.NUTIN_ASSUME_YES === '1' || process.argv.includes('-y') || process.argv.includes('--yes');
}

/**
 * Whether missing opt-in deps are installed: 'install', 'prompt' (ask first) or 'refuse'.
 * A production build only installs from an interactive terminal, so -y doesn't apply there.
 * A dev build also installs with -y/--yes outside a terminal.
 */
export function installDecision({ isProd, tty, yes }) {
  if (!tty && (isProd || !yes)) return 'refuse';
  return yes ? 'install' : 'prompt';
}

// The install's environment: without NODE_ENV, which a prod build sets (builder.config.js).
// Under NODE_ENV=production, npm, pnpm and yarn skip devDependencies:
// "install -D" would then remove the project's devDependencies instead of adding the missing ones.
export function installEnv(env) {
  const { NODE_ENV: _nodeEnv, ...rest } = env;
  return rest;
}

/**
 * Makes sure an opt-in feature's devDependencies are installed before its build step imports them.
 * See installDecision for when it installs.
 */
export async function ensureDeps({ feature, deps, isProd, origin }) {
  const missing = deps.filter((dep) => !isInstalled(dep.name));
  if (!missing.length) return;

  const packageManager = detectPackageManager();
  const [command, args] = getDevInstallArgs(packageManager, missing);
  const installCommand = [command, ...args].join(' ');
  const decision = installDecision({ isProd, tty: Boolean(process.stdin.isTTY), yes: assumeYes() });

  if (isProd && decision === 'refuse') {
    errorExit(`${feature} is enabled but its dependencies are missing.\nRun "${installCommand}" before rebuilding (a production build outside an interactive terminal doesn't install packages).`, origin);
  }

  print.warn(`${feature} is enabled but its dependencies are missing.`);
  print.gray('Required packages:');
  missing.forEach((dep) => print.gray(`  - ${dep.name}@${dep.version}`));

  let shouldInstall;
  if (decision === 'install') {
    print.gray(`-y/--yes passed. Installing automatically: ${installCommand}`);
    shouldInstall = true;
  } else if (decision === 'prompt') {
    shouldInstall = await promptBoolean('Install them now?');
  } else {
    // The dev watcher (NUTIN_WATCH) runs its builds without a terminal, and no flag reaches them.
    const retry = process.env.NUTIN_WATCH === '1'
      ? 'then restart the dev server'
      : `or build with "${buildWithYes(packageManager)}" to install them automatically`;
    errorExit(`They can't be installed from a non-interactive shell. Run "${installCommand}", ${retry}.`, origin);
  }

  if (!shouldInstall) {
    print.boldError(`Aborting. Install them with "${installCommand}".`);
    process.exit(1);
  }

  try {
    await runCommand(command, args, { env: installEnv(process.env) });
  } catch (err) {
    errorExit(err, `${origin}-install`);
  }
}
