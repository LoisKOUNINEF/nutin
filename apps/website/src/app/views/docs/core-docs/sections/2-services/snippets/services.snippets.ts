import { snippetsManager } from '../../../../../../helpers/index.js';
import RouterSnippet from './router.snippet.json' with { type: 'json' };
import EventBusSnippet from './event-bus.snippet.json' with { type: 'json' };
import HttpClientSnippet from './http-client.snippet.json' with { type: 'json' };
import i18nSnippet from './i18n.snippet.json' with { type: 'json' };
import PipeRegistrySnippet from './pipe-registry.snippet.json' with { type: 'json' };
import StoreSnippet from './store.snippet.json' with { type: 'json' };

export default snippetsManager([
	RouterSnippet,
	EventBusSnippet,
	HttpClientSnippet,
	i18nSnippet,
	StoreSnippet,
	PipeRegistrySnippet
]);
