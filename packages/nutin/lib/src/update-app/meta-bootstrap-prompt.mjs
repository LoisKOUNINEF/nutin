import inquirer from 'inquirer';
import { print } from '../utils/print.mjs';
import { FEATURES } from '../common/feature-registry.mjs';
import { detectPackageManager } from '../common/package-json-helper.mjs';
import { writeProjectMeta } from '../common/project-meta.mjs';

export async function bootstrapProjectMeta(projectPath) {
  print.section('⚠️  No .nutin-meta.json found — this project predates nutin-update.');
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
  const flags = Object.fromEntries(FEATURES.map((f) => [f.key, features.includes(f.key)]));

  return writeProjectMeta(projectPath, { version: version.trim(), packageManager, ...flags });
}
