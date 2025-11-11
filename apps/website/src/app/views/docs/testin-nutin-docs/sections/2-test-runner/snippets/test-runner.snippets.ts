import { snippetsManager } from '../../../../../../helpers/index.js';
import RunTestSnippet from './run-tests.snippet.json' with { type: 'json' };
import ConfigSnippet from './config.snippet.json' with { type: 'json' }

export default snippetsManager([
	RunTestSnippet,
	ConfigSnippet,
]);
