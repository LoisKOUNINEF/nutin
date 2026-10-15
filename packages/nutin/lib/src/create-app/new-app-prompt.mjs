import inquirer from 'inquirer';
import { defaults } from './context-builder.mjs';
import { PACKAGE_MANAGERS } from '../common/package-json-helper.mjs';

export async function newAppPrompt(initialName, cliOptions = {}) {

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
  } else {
    const validationResult = validateProjectName(projectName);
    if (validationResult !== true) {
      throw new Error(validationResult);
    }
  }

  let packageManager = cliOptions.packageManager;
  if (!packageManager) {
    const pmPreference = await inquirer.prompt([
      {
        type: 'select',
        name: 'packageManager',
        message: 'Package manager:',
        choices: PACKAGE_MANAGERS,
        default: defaults.packageManager,
      },
    ]);
    packageManager = pmPreference.packageManager;
  }

  return {
    projectName,
    packageManager,
    lang: cliOptions.jsOnly ? 'js' : 'ts',
  };
}

function validateProjectName(input) {
  if (!input.trim()) return 'Project name is required';
  if (!/^[a-z0-9-_]+$/.test(input)) {
    return 'Use only lowercase letters, numbers, hyphens, and underscores';
  }
  return true;
}
