import { program } from 'commander';
import { print } from './src/print.mjs';
import { promptUser } from './src/prompts.mjs';
import { createProject } from './src/project-generator.mjs';
import { displaySuccessMessage } from './src/utils.mjs';
import { packageVersion } from './src/version.mjs';

export async function createApp() {
  program
    .version(packageVersion)
    .argument('[projectName]', 'Name of the project')
    .option('-d, --defaults', 'Use default options')
    .option('-pm, --package-manager <manager>', 'Specify package manager (npm, yarn, pnpm, bun)')
    .option('--template', '(Default) Use external templates')
    .option('--no-template', 'Do not use external templates')
    .option('--stylin-nutin', '(Default) Use built-in SCSS utility classes & mixins')
    .option('--no-stylin-nutin', 'Do not use built-in SCSS utility')
    .option('--i18n', 'Use i18n & json-based content')
    .option('--no-i18n', '(Default) Do not use i18n & json-based content')
    .option('--deploy-helper', 'Use Docker & deployment helpers')
    .option('--no-deploy-helper', '(Default) Do not use Docker & deployment helpers')
    .option('--testin-nutin', 'Use testin-nutin toolkit')
    .option('--no-testin-nutin', '(Default) Do not use testin-nutin toolkit')
    .option('--transition', 'Use animated view transitions\nNote: May interfere with CSS `position: fixed`, `z-index`...')
    .option('--no-transition', '(Default) Do not use animated view transitions')
    .addHelpText('afterAll', '\nChaining options :\nExample: -d -pm npm --i18n --testinNutin')
    .action(async (projectName, cliOptions) => {
      print.blue('🚀 Welcome to nutin !');

      try {
        const answers = await promptUser(projectName, cliOptions);
        await createProject(answers);
        displaySuccessMessage(answers);
      } catch (error) {
        print.boldError(`❌ Error creating project: ${error.message}`);
        process.exit(1);
      }
    });

  program.parse();
}
