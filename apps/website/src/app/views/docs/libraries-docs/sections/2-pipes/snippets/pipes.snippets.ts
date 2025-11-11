import { snippetsManager } from '../../../../../../helpers/index.js';
import DefaultPipesSnippet from './default-pipes.snippet.json' with { type: 'json' };
import CustomPipesSnippet from './custom-pipes.snippet.json' with { type: 'json' };
import UsageSnippet from './usage.snippet.json' with { type: 'json' };

export default snippetsManager([
	DefaultPipesSnippet, 
	CustomPipesSnippet,
	UsageSnippet
]);
