import { Command, Option } from 'commander';
import { print } from './src/utils/print.mjs';
import { UserError, reportError } from './src/utils/errors.mjs';
import { newAppPrompt } from './src/create-app/new-app-prompt.mjs';
import { createProject } from './src/create-app/project-generator.mjs';
import { displaySuccessMessage } from './src/create-app/success-message.mjs';
import { PACKAGE_VERSION } from './src/common/package-data.mjs';
import { FEATURES, findFeatureByCli } from './src/common/feature-registry.mjs';
import { PACKAGE_MANAGERS } from './src/common/package-json-helper.mjs';
import { EXTENSION_SURFACES } from './src/common/extension.mjs';
import { addFeatureToProject, addAllFeatures } from './src/add-feature/feature-adder.mjs';
import { updateProject } from './src/update-app/project-updater.mjs';

// --debug, on every command: stacks for every error, and the detail lines. Set as NUTIN_DEBUG=1, which
// the generated project's tools read too (e.g. NUTIN_DEBUG=1 nutin-update in CI).
function withDebugOption(command) {
  return command
    .option('--debug', 'Show stack traces and detail lines (same as NUTIN_DEBUG=1)')
    .hook('preAction', (_command, actionCommand) => {
      if (actionCommand.opts().debug) process.env.NUTIN_DEBUG = '1';
    });
}

// The one place a failed command is reported and its exit code set (see reportError()).
function action(context, fn) {
  return async (...args) => {
    try {
      await fn(...args);
    } catch (error) {
      process.exitCode = reportError(context, error);
    }
  };
}

export function createAppCommand(command) {
  return withDebugOption(command)
    .version(PACKAGE_VERSION)
    .configureOutput({
      helpWidth: 100
    })
    .argument('[projectName]', 'Name of the project')
    // Restricted to known managers: the value ends up in shell commands and package.json scripts.
    .addOption(new Option('-p, --package-manager <manager>', 'Specify package manager').choices(PACKAGE_MANAGERS))
    .option('--js-only', 'Generate a plain JavaScript project (no TypeScript)')
    .addOption(new Option('--extension [surface]', 'Generate a browser extension (Chrome and Firefox): the app is its side panel or popup (the surface is asked when not given)').choices(EXTENSION_SURFACES))
    .action(action('Error creating project', async (projectName, cliOptions) => {
      print.boldSuccess('\n🚀 Welcome to your new nutin app!\n');
      const preferences = await newAppPrompt(projectName, cliOptions);
      await createProject(preferences);
      displaySuccessMessage(preferences);
    }));
}

export function addFeatureCommand(command) {
  const featureChoices = [...FEATURES.map((feature) => feature.cli), 'all'];

  return withDebugOption(command)
    .version(PACKAGE_VERSION)
    .configureOutput({
      helpWidth: 100
    })
    .argument('<feature>', `Feature to add to the current project: ${featureChoices.join(', ')}`)
    .action(action('Error adding feature', async (featureArg) => {
      if (!featureChoices.includes(featureArg)) {
        throw new UserError(`Unknown feature "${featureArg}".`, { hint: `Choose one of: ${featureChoices.join(', ')}.` });
      }

      if (featureArg === 'all') {
        await addAllFeatures();
      } else {
        await addFeatureToProject(findFeatureByCli(featureArg).key);
      }
    }));
}

export function updateAppCommand(command) {
  return withDebugOption(command)
    .version(PACKAGE_VERSION)
    .configureOutput({
      helpWidth: 100
    })
    .option('-y, --yes', 'Skip the confirmation prompt and apply safe updates immediately')
    .option('--from <path>', 'Use a local templates/ directory as the old baseline instead of fetching from npm')
    .option('--allow-dirty', 'Update even with uncommitted changes or untracked files, or outside a git repository (the update then can\'t be undone with git)')
    .action(action('Error updating project', async (cliOptions) => {
      print.boldSuccess('🚀 nutin — update');
      await updateProject(process.cwd(), cliOptions);
    }));
}

export function buildCli() {
  const program = new Command();
  program.name('nutin').version(PACKAGE_VERSION);

  createAppCommand(program.command('new', { isDefault: true }).description('Create a new nutin app'));
  addFeatureCommand(program.command('add').description('Add a feature to the current project'));
  updateAppCommand(program.command('update').description('Update nutin while preserving your changes'));

  return program;
}
