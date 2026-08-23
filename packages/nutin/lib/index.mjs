import { Command } from 'commander';
import { print, chalk } from './src/utils/print.mjs';
import { newAppPrompt } from './src/create-app/new-app-prompt.mjs';
import { createProject } from './src/create-app/project-generator.mjs';
import { displaySuccessMessage } from './src/create-app/success-message.mjs';
import { PACKAGE_VERSION } from './src/common/package-data.mjs';
import { FEATURES, findFeatureByCli } from './src/common/feature-registry.mjs';
import { addFeatureToProject } from './src/add-feature/feature-adder.mjs';
import { updateProject } from './src/update-app/project-updater.mjs';

export function createAppCommand(command) {
  return command
    .version(PACKAGE_VERSION)
    .configureOutput({
      helpWidth: 100
    })
    .argument('[projectName]', 'Name of the project')
    .option('-pm, --package-manager <manager>', 'Specify package manager (npm, yarn, pnpm, bun)')
    .action(async (projectName, cliOptions) => {
      print.boldSuccess('\n🚀 Welcome to your new nutin app!\n');
      try {
        const preferences = await newAppPrompt(projectName, cliOptions);
        await createProject(preferences);
        displaySuccessMessage(preferences);
      } catch (error) {
        print.boldError(`❌ Error creating project: ${error.stack}`);
        process.exit(1);
      }
    });
}

export function addFeatureCommand(command) {
  const featureChoices = [...FEATURES.map((feature) => feature.cli), 'all'];

  return command
    .version(PACKAGE_VERSION)
    .configureOutput({
      helpWidth: 100
    })
    .argument('<feature>', `Feature to add to the current project: ${featureChoices.join(', ')}`)
    .action(async (featureArg) => {
      if (!featureChoices.includes(featureArg)) {
        print.boldError(`❌ Unknown feature "${featureArg}". Choose one of: ${featureChoices.join(', ')}`);
        process.exit(1);
      }

      try {
        if (featureArg === 'all') {
          for (const feature of FEATURES) {
            await addFeatureToProject(feature.key);
          }
        } else {
          const feature = findFeatureByCli(featureArg);
          await addFeatureToProject(feature.key);
        }
      } catch (error) {
        print.boldError(`❌ Error adding feature: ${error.stack}`);
        process.exit(1);
      }
    });
}

export function updateAppCommand(command) {
  return command
    .version(PACKAGE_VERSION)
    .configureOutput({
      helpWidth: 100
    })
    .option('-y, --yes', 'Skip the confirmation prompt and apply safe updates immediately')
    .option('--from <path>', 'Use a local templates/ directory as the old baseline instead of fetching from npm')
    .action(async (cliOptions) => {
      print.boldSuccess('🚀 nutin — update');

      try {
        await updateProject(process.cwd(), cliOptions);
      } catch (error) {
        print.boldError(`❌ Error updating project: ${error.stack}`);
        process.exit(1);
      }
    });
}

export function buildCli() {
  const program = new Command();
  program.name('nutin').version(PACKAGE_VERSION);

  createAppCommand(program.command('new', { isDefault: true }).description('Create a new nutin app'));
  addFeatureCommand(program.command('add').description('Add a feature to the current project'));
  updateAppCommand(program.command('update').description('Update nutin while preserving your changes'));

  return program;
}
