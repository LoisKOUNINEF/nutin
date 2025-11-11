import { snippetsManager } from '../../../../../../helpers/index.js';
import BaseComponentSnippet from './base-component.snippet.json' with { type: 'json' };
import ComponentSnippet from './component.snippet.json' with { type: 'json' };
import ViewSnippet from './view.snippet.json' with { type: 'json' };
import ServiceSnippet from './service.snippet.json' with { type: 'json' };

export default snippetsManager([
	BaseComponentSnippet,
	ComponentSnippet,
	ViewSnippet,
	ServiceSnippet,
]);
