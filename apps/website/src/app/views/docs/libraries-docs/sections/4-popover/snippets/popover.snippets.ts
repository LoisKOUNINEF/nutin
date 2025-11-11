import { snippetsManager } from '../../../../../../helpers/index.js';
import StyleSnippet from './style.snippet.json' with { type: 'json'};
import UsageSnippet from './usage.snippet.json' with { type: 'json'};

export default snippetsManager([
	StyleSnippet,
	UsageSnippet,
]);
