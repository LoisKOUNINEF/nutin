import { program } from 'commander';
import { print, chalk } from './src/utils/print.mjs';
import { newAppPrompt } from './src/create-app/new-app-prompt.mjs';
import { createProject } from './src/create-app/project-generator.mjs';
import { displaySuccessMessage } from './src/create-app/success-message.mjs';
import { PACKAGE_VERSION } from './src/common/package-data.mjs';
import { FEATURES, findFeatureByCli } from './src/common/feature-registry.mjs';
import { addFeatureToProject } from './src/add-feature/feature-adder.mjs';
import { updateProject } from './src/update-app/project-updater.mjs';

export async function createApp() {
  program
    .version(PACKAGE_VERSION)
    .configureOutput({
      helpWidth: 100 
    })
    .argument('[projectName]', 'Name of the project')
    .option('-pm, --package-manager <manager>', 'Specify package manager (npm, yarn, pnpm, bun)')
    .option('--preset <preset>', 
      `${chalk.yellow('Project preset configuration:')}
      ${chalk.cyan('• standard')}${chalk.boldGray('  - built-in libraries')}
      ${chalk.cyan('• full')}${chalk.boldGray('      - standard + testing toolkit & deployment helpers')}`
    )
    .option('--libs', 'Built-in libraries')
    .option('--deploy-helper', 'Dockerfile & nginx.conf')
    .option('--testin-nutin', 'Lightweight testing toolkit')
    .action(async (projectName, cliOptions) => {
      print.blue('🚀 Welcome to nutin !');
      try {
        const preferences = await newAppPrompt(projectName, cliOptions);
        await createProject(preferences);
        displaySuccessMessage(preferences);
      } catch (error) {
        print.boldError(`❌ Error creating project: ${error.stack}`);
        process.exit(1);
      }
    });

  program.parse();
}

export async function addFeature() {
  const featureChoices = [...FEATURES.map((feature) => feature.cli), 'libs', 'all'];

  program
    .version(PACKAGE_VERSION)
    .configureOutput({
      helpWidth: 100
    })
    .argument('<feature>', `Feature to add to the current project: ${featureChoices.join(', ')}`)
    .action(async (featureArg) => {
      print.blue('🚀 nutin — add feature');

      if (!featureChoices.includes(featureArg)) {
        print.boldError(`❌ Unknown feature "${featureArg}". Choose one of: ${featureChoices.join(', ')}`);
        process.exit(1);
      }

      try {
        if (featureArg === 'libs') {
          for (const feature of FEATURES) {
            if (feature.key === 'testinNutin' || feature.key === 'deployHelper') {
              continue;
            } else await addFeatureToProject(feature.key);
          }
        } else if (featureArg === 'all') {
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

  program.parse();
}

export async function updateApp() {
  program
    .version(PACKAGE_VERSION)
    .configureOutput({
      helpWidth: 100
    })
    .option('-y, --yes', 'Skip the confirmation prompt and apply safe updates immediately')
    .option('--from <path>', 'Use a local templates/ directory as the old baseline instead of fetching from npm')
    .action(async (cliOptions) => {
      print.blue('🚀 nutin — update');

      try {
        await updateProject(process.cwd(), cliOptions);
      } catch (error) {
        print.boldError(`❌ Error updating project: ${error.stack}`);
        process.exit(1);
      }
    });

  program.parse();
}

