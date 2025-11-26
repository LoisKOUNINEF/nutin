import inquirer from 'inquirer';
import { defaults } from './context-builder.mjs';

export async function promptUser(initialName, cliOptions = {}) {

  let projectName = initialName;
  if (!projectName) {
    const nameAnswer = await inquirer.prompt([
      {
        type: 'input',
        name: 'projectName',
        message: 'Project name:',
        default: defaults.projectName,
        validate: validateProjectName
      }
    ]);
    projectName = nameAnswer.projectName;
  }

  let packageManager = cliOptions.packageManager;
  if (!packageManager) {
    const pmAnswer = await inquirer.prompt([
      {
        type: 'list',
        name: 'packageManager',
        message: 'Package manager:',
        choices: ['npm', 'yarn', 'pnpm', 'bun'],
        default: defaults.packageManager
      }
    ]);
    packageManager = pmAnswer.packageManager;
  }

  if (cliOptions.defaults) {
    return {
      projectName,
      packageManager,
      stylinNutin: cliOptions.stylinNutin,
      template: cliOptions.template,
      i18n: cliOptions.i18n,
      deployHelper: cliOptions.deployHelper,
      testinNutin: cliOptions.testinNutin,
      transition: cliOptions.transitions
    };
  }

  const questions = [];

  if (cliOptions.stylinNutin === undefined) {
    questions.push({
      type: 'confirm',
      name: 'stylinNutin',
      message: 'Use built-in SCSS utility classes ?',
      default: defaults.stylinNutin
    });
  }

  if (cliOptions.template === undefined) {
    questions.push({
      type: 'confirm',
      name: 'template',
      message: 'Use external templates ?',
      default: defaults.template
    });
  }

  if (cliOptions.i18n === undefined) {
    questions.push({
      type: 'confirm',
      name: 'i18n',
      message: 'Use i18n with json-based content ?',
      default: defaults.i18n
    });
  }

  if (cliOptions.deployHelper === undefined) {
    questions.push({
      type: 'confirm',
      name: 'deployHelper',
      message: 'Use Docker & deployment helpers ?',
      default: defaults.deployHelper
    });
  }

  if (cliOptions.testinNutin === undefined) {
    questions.push({
      type: 'confirm',
      name: 'testinNutin',
      message: 'Use testin-nutin toolkit?',
      default: defaults.testinNutin
    });
  }

  if (cliOptions.transition === undefined) {
    questions.push({
      type: 'confirm',
      name: 'transition',
      message: 'Use animated view transitions?',
      default: defaults.transition
    });
  }

  const answers = questions.length > 0 ? await inquirer.prompt(questions) : {};

  return {
    projectName,
    packageManager,
    template: cliOptions.template ?? answers.template,
    stylinNutin: cliOptions.stylinNutin ?? answers.stylinNutin,
    i18n: cliOptions.i18n ?? answers.i18n,
    deployHelper: cliOptions.deployHelper ?? answers.deployHelper,
    transition: cliOptions.transition ?? answers.transition,
    testinNutin: cliOptions.testinNutin ?? answers.testinNutin
  };
}

function validateProjectName(input) {
  if (!input.trim()) return 'Project name is required';
  if (!/^[a-z0-9-_]+$/.test(input)) {
    return 'Use only lowercase letters, numbers, hyphens, and underscores';
  }
  return true;
}
