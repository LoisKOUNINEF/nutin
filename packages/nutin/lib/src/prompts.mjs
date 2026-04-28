import inquirer from 'inquirer';
import { defaults } from './context-builder.mjs';

export async function promptUser(initialName, cliOptions = {}) {

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

  return {
    projectName,
    packageManager,
    preset: cliOptions.preset,
    i18n: cliOptions.i18n,
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
