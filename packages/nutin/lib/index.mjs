import { program } from 'commander';
import { print, chalk } from './src/print.mjs';
import { promptUser } from './src/prompts.mjs';
import { createProject } from './src/project-generator.mjs';
import { displaySuccessMessage } from './src/utils.mjs';
import { packageVersion } from './src/version.mjs';

export async function createApp() {
  program
    .version(packageVersion)
    .configureOutput({
      helpWidth: 100 
    })
    .argument('[projectName]', 'Name of the project')
    .option('-pm, --package-manager <manager>', 'Specify package manager (npm, yarn, pnpm, bun)')
    .option('--preset <preset>', 
      `${chalk.yellow('Project preset configuration:')}
      ${chalk.cyan('• minimal')}${chalk.boldGray('        - external templates')}
      ${chalk.cyan('• standard')}${chalk.boldGray('       - minimal + i18n & small UI library')}
      ${chalk.cyan('• full')}${chalk.boldGray('           - standard + deployment helpers & built-in testing toolkit')}`
    )
    .option('--options <options>',
      `${chalk.yellow('Comma-separated list of additional options:')}
      ${chalk.cyan('• i18n')}${chalk.boldGray('           - i18n & json-based content')}
      ${chalk.cyan('• libs')}${chalk.boldGray('           - small UI library')}
      ${chalk.cyan('• deploy-helper')}${chalk.boldGray('  - Docker & deployment helpers')}
      ${chalk.cyan('• testing')}${chalk.boldGray('        - built-in testing toolkit')}
      ${chalk.cyan('• transition')}${chalk.boldGray('     - animated view transitions - NOTE: may break position:absolute and similar properties')}`,
      (val) => val.split(',').map((s) => s.trim()).filter(Boolean)
    )
    .action(async (projectName, cliOptions) => {
      // Normalize options array into the shape the rest of the app expects
      const options = cliOptions.options ?? [];
      const normalizedOptions = {
        ...cliOptions,
        i18n:          options.includes('i18n') || undefined,
        deployHelper:  options.includes('deploy-helper') || undefined,
        stylinNutin:   options.includes('libs') || undefined,
        testinNutin:   options.includes('testing') || undefined,
        transition:    options.includes('transition') || undefined,
      };
      print.blue('🚀 Welcome to nutin !');
      try {
        const preferences = await promptUser(projectName, normalizedOptions);
        await createProject(preferences);
        displaySuccessMessage(preferences);
      } catch (error) {
        print.boldError(`❌ Error creating project: ${error.stack}`);
        process.exit(1);
      }
    });

  program.parse();
}

