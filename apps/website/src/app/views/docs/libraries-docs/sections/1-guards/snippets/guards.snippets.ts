import { snippetsManager } from '../../../../../../helpers/index.js';
import GuardsLibrarySnippet from './guards-library.snippet.json' with { type: 'json' };
import UsageSnippet from './usage.snippet.json' with { type: 'json' };

export default snippetsManager([
	GuardsLibrarySnippet,
	UsageSnippet,
]);
