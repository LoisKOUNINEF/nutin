import { BuildSectionHelper } from '../../../../../helpers/index.js';
import DataCatalogSnippet from './snippets/data-catalog.snippet.json' with { type: 'json' };
import DataComponentSnippet from './snippets/data-component.snippet.json' with { type: 'json' };
import DataOptionalSnippet from './snippets/data-optional.snippet.json' with { type: 'json' };
import EventBindingSnippet from './snippets/event-binding.snippet.json' with { type: 'json' };
import DataI18nSnippet from './snippets/data-i18n.snippet.json' with { type: 'json' };
import DataPipeSnippet from './snippets/data-pipe.snippet.json' with { type: 'json' };
import DataAttributesSection from './data-attributes.section.json' with { type: "json" };

export default BuildSectionHelper.buildSection(
	DataAttributesSection, 
	[
		DataCatalogSnippet,
		DataComponentSnippet,
		DataOptionalSnippet,
		EventBindingSnippet,
		DataI18nSnippet,
		DataPipeSnippet,
	]
);
