import inquirer from 'inquirer';
import { defaults } from './context-builder.mjs';

export async function promptUser(initialName, cliOptions = {}) {
  const PRESET_CHOICES = [
    { name: 'minimal   — external templates', value: 'minimal' },
    { name: 'standard  — minimal + i18n & UI library', value: 'standard' },
    { name: 'full      — standard + deployment & testing', value: 'full' },
  ];

  let projectName = initialName;
  if (!projectName) {
    const nameInput = await inquirer.prompt([
      {
        type: 'input',
        name: 'projectName',
        message: 'Project name:',
        default: defaults.projectName,
        validate: validateProjectName,
      },
    ]);
    projectName = nameInput.projectName;
  }

  let packageManager = cliOptions.packageManager;
  if (!packageManager) {
    const pmPreference = await inquirer.prompt([
      {
        type: 'list',
        name: 'packageManager',
        message: 'Package manager:',
        choices: ['npm', 'yarn', 'pnpm', 'bun'],
        default: defaults.packageManager,
      },
    ]);
    packageManager = pmPreference.packageManager;
  }

  let preset = cliOptions.preset;
  if (!preset && !cliOptions.hasOptions) {
    const presetChoice = await inquirer.prompt([
      {
        type: 'list',
        name: 'preset',
        message: 'Preset:',
        choices: PRESET_CHOICES,
        default: 'minimal',
      },
    ]);
    preset = presetChoice.preset;
  }

  return {
    projectName,
    packageManager,
    preset,
    i18n: cliOptions.i18n,
    stylinNutin: cliOptions.stylinNutin,
    deployHelper: cliOptions.deployHelper,
    testinNutin: cliOptions.testinNutin,
    transition:   cliOptions.transition,
  };
}

function validateProjectName(input) {
  if (!input.trim()) return 'Project name is required';
  if (!/^[a-z0-9-_]+$/.test(input)) {
    return 'Use only lowercase letters, numbers, hyphens, and underscores';
  }
  return true;
}
