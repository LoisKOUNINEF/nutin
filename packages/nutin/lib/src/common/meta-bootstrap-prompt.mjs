import path from 'path';
import * as fsExtra from 'fs-extra';
import inquirer from 'inquirer';
import { print } from '../utils/print.mjs';
import { FEATURES } from './feature-registry.mjs';
import { detectPackageManager } from './package-json-helper.mjs';
import { writeProjectMeta } from './project-meta.mjs';
import { META_FILE_NAME } from './package-data.mjs';

const fs = fsExtra.default;

// `--js-only` apps have src/app/main.js and no main.ts. Projects from before JS-only
// support are all TypeScript, so anything else counts as 'ts'.
async function detectLang(projectPath) {
  const appDir = path.join(projectPath, 'src', 'app');
  const hasMainJs = await fs.pathExists(path.join(appDir, 'main.js'));
  const hasMainTs = await fs.pathExists(path.join(appDir, 'main.ts'));
  return hasMainJs && !hasMainTs ? 'js' : 'ts';
}

export async function bootstrapProjectMeta(projectPath) {
  // inquirer can't prompt without a TTY: it throws on a closed stdin and waits forever on an open pipe.
  if (!process.stdin.isTTY) {
    throw new Error(
      `No ${META_FILE_NAME} found for this project, and this shell is non-interactive, so it can't be reconstructed. ` +
      `Run this command again in a terminal to answer a couple of questions, or create ${META_FILE_NAME} yourself, e.g. ` +
      `{ "version": "1.3.1", "packageManager": "npm", "lang": "ts", "features": { "docker": false, "markdown": false } } ` +
      `("lang": "js" for a --js-only project)`
    );
  }

  print.warn(`⚠️  No ${META_FILE_NAME} found for this project.`);
  print.section('Answer a couple of questions so a baseline can be reconstructed:\n');

  const { version } = await inquirer.prompt([
    {
      type: 'input',
      name: 'version',
      message: 'Which nutin version was this project originally created with (e.g. 1.3.1)?',
      validate: (input) => /^\d+\.\d+\.\d+$/.test(input.trim()) || 'Enter a version like 1.3.1',
    },
  ]);

  const { features } = await inquirer.prompt([
    {
      type: 'checkbox',
      name: 'features',
      message: 'Which optional features does this project have?',
      choices: FEATURES.map((feature) => ({ name: feature.key, value: feature.key })),
    },
  ]);

  const packageManager = await detectPackageManager(projectPath);
  const lang = await detectLang(projectPath);
  const flags = Object.fromEntries(FEATURES.map((f) => [f.key, features.includes(f.key)]));

  print.gray(`Detected ${lang === 'js' ? 'a JavaScript' : 'a TypeScript'} project using ${packageManager} — edit ${META_FILE_NAME} if that's wrong.`);
  return writeProjectMeta(projectPath, { version: version.trim(), packageManager, lang, ...flags });
}
