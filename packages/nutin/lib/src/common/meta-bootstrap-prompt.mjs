import path from 'path';
import * as fsExtra from 'fs-extra';
import inquirer from 'inquirer';
import { print } from '../utils/print.mjs';
import { FEATURES } from './feature-registry.mjs';
import { detectPackageManager } from './package-json-helper.mjs';
import { writeProjectMeta } from './project-meta.mjs';
import { META_FILE_NAME, PACKAGE_VERSION } from './package-data.mjs';
import { EXTENSION_INCOMPATIBLE_FEATURES } from './extension.mjs';
import { UserError } from '../utils/errors.mjs';

const fs = fsExtra.default;

// `--js-only` apps have src/app/main.js and no main.ts. Projects from before JS-only
// support are all TypeScript, so anything else counts as 'ts'.
async function detectLang(projectPath) {
  const appDir = path.join(projectPath, 'src', 'app');
  const hasMainJs = await fs.pathExists(path.join(appDir, 'main.js'));
  const hasMainTs = await fs.pathExists(path.join(appDir, 'main.ts'));
  return hasMainJs && !hasMainTs ? 'js' : 'ts';
}

// A browser extension project has src/extension/manifest.json; its surface shows in it
// (action.default_popup for the popup, side_panel otherwise). false for a web app.
async function detectExtension(projectPath) {
  const manifestPath = path.join(projectPath, 'src', 'extension', 'manifest.json');
  if (!(await fs.pathExists(manifestPath))) return false;
  const manifest = await fs.readFile(manifestPath, 'utf-8');
  return manifest.includes('default_popup') ? 'popup' : 'side-panel';
}

export async function bootstrapProjectMeta(projectPath) {
  // inquirer can't prompt without a TTY: it throws on a closed stdin and waits forever on an open pipe.
  if (!process.stdin.isTTY) {
    throw new UserError(
      `No ${META_FILE_NAME} found for this project, and this shell is non-interactive, so it can't be reconstructed.`,
      {
        hint: `Run this command again in a terminal to answer a couple of questions, or create ${META_FILE_NAME} yourself, e.g. ` +
          `{ "version": "${PACKAGE_VERSION}", "packageManager": "npm", "lang": "ts", "extension": false, "features": { "docker": false, "markdown": false } } ` +
          '("lang": "js" for a --js-only project, "extension": "popup" or "side-panel" for a browser extension).',
      },
    );
  }

  print.warn(`⚠️  No ${META_FILE_NAME} found for this project.`);
  print.section('Answer a couple of questions so a baseline can be reconstructed:\n');

  const { version } = await inquirer.prompt([
    {
      type: 'input',
      name: 'version',
      message: `Which nutin version was this project last created or updated with (e.g. ${PACKAGE_VERSION})?`,
      validate: (input) => /^\d+\.\d+\.\d+$/.test(input.trim()) || `Enter a version like ${PACKAGE_VERSION}.`,
    },
  ]);

  const extension = await detectExtension(projectPath);
  // An extension can't have any of the optional features: nothing to ask.
  const featureChoices = FEATURES.filter((feature) => !(extension && EXTENSION_INCOMPATIBLE_FEATURES[feature.key]));
  const { features } = featureChoices.length === 0 ? { features: [] } : await inquirer.prompt([
    {
      type: 'checkbox',
      name: 'features',
      message: 'Which optional features does this project have?',
      choices: featureChoices.map((feature) => ({ name: feature.key, value: feature.key })),
    },
  ]);

  const packageManager = await detectPackageManager(projectPath);
  const lang = await detectLang(projectPath);
  const flags = Object.fromEntries(FEATURES.map((f) => [f.key, features.includes(f.key)]));

  const kind = `${lang === 'js' ? 'a JavaScript' : 'a TypeScript'} ${extension ? `browser extension (${extension})` : 'project'}`;
  print.gray(`Detected ${kind} using ${packageManager} — edit ${META_FILE_NAME} if that's wrong.`);
  return writeProjectMeta(projectPath, { version: version.trim(), packageManager, lang, extension, ...flags });
}
