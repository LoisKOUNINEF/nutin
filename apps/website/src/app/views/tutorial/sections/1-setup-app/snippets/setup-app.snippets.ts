import setupCommand from './setup-command.json' with { type: "json" };
import checkCommand from './check-command.json' with { type: "json" };
import { snippetsManager } from '../../../../../helpers/index.js';

const setupAppLocalizedSnippets: LocalizedSnippet[] = [];

setupAppLocalizedSnippets.push(
	setupCommand,
	checkCommand,
); 

const SetupAppSnippets: ISnippet[] = snippetsManager(setupAppLocalizedSnippets);

export default SetupAppSnippets;
