import { BuildSectionHelper } from '../../../../../helpers/index.js';
import RouterSnippet from './snippets/router.snippet.json' with { type: 'json' };
import EventBusSnippet from './snippets/event-bus.snippet.json' with { type: 'json' };
import HttpClientSnippet from './snippets/http-client.snippet.json' with { type: 'json' };
import I18nSnippet from './snippets/i18n.snippet.json' with { type: 'json' };
import PipeRegistrySnippet from './snippets/pipe-registry.snippet.json' with { type: 'json' };
import StoreSnippet from './snippets/store.snippet.json' with { type: 'json' };
import ServicesSection from './services.section.json' with { type: "json" };

export default BuildSectionHelper.buildSection(
	ServicesSection, 
	[
		RouterSnippet,
		EventBusSnippet,
		HttpClientSnippet,
		I18nSnippet,
		PipeRegistrySnippet,
		StoreSnippet,
	]
);
