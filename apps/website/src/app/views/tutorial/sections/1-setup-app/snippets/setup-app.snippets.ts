import SetupCommandSnippet from './setup-command.snippet.json' with { type: "json" };
import CheckCommandSnippet from './check-command.snippet.json' with { type: "json" };
import { snippetsManager } from '../../../../../helpers/index.js';

export default snippetsManager([
	SetupCommandSnippet,
	CheckCommandSnippet,
]);
