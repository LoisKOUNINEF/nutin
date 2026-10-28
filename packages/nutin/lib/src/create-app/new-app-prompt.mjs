import inquirer from 'inquirer';
import { defaults } from './context-builder.mjs';
import { PACKAGE_MANAGERS } from '../common/package-json-helper.mjs';
import { EXTENSION_SURFACES } from '../common/extension.mjs';

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

  // --extension alone (commander gives `true`) asks which surface; without the flag it's a web app.
  let extension = cliOptions.extension ?? false;
  if (extension === true) {
    const surfacePreference = await inquirer.prompt([
      {
        type: 'select',
        name: 'extension',
        message: 'Extension surface:',
        choices: [
          { name: 'Side panel (Chrome side panel, Firefox sidebar)', value: 'side-panel' },
          { name: 'Popup (opens from the toolbar button)', value: 'popup' },
        ],
        default: EXTENSION_SURFACES[0],
      },
    ]);
    extension = surfacePreference.extension;
  }

  return {
    projectName,
    packageManager,
    lang: cliOptions.jsOnly ? 'js' : 'ts',
    extension,
  };
}

function validateProjectName(input) {
  if (!input.trim()) return 'Project name is required';
  if (!/^[a-z0-9-_]+$/.test(input)) {
    return 'Use only lowercase letters, numbers, hyphens, and underscores';
  }
  return true;
}
