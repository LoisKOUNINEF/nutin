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
      ${chalk.cyan('• minimal')}${chalk.boldGray('   - external templates')}
      ${chalk.cyan('• standard')}${chalk.boldGray('  - minimal + i18n & built-in SCSS utilities')}
      ${chalk.cyan('• full')}${chalk.boldGray('      - standard + deployment helpers & built-in testing toolkit')}
      ${chalk.cyan('• cicd')}${chalk.boldGray('      - minimal + deployment helpers')}`
    )
    .option('--i18n', 'Use i18n & json-based content')
    .option('--deploy-helper', 'Use Docker & deployment helpers')
    .option('--testin-nutin', 'Use built-in testing toolkit')
    .option('--transition', 'Use animated view transitions\nNote: may interfere with CSS `position: fixed`, `z-index`…')
    .action(async (projectName, cliOptions) => {
      print.blue('🚀 Welcome to nutin !');
      try {
        const preferences = await promptUser(projectName, cliOptions);
        await createProject(preferences);
        displaySuccessMessage(preferences);
      } catch (error) {
        print.boldError(`❌ Error creating project: ${error.stack}`);
        process.exit(1);
      }
    });

  program.parse();
}

