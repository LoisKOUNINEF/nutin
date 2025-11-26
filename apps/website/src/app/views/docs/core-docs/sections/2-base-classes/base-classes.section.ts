import { BuildSectionHelper } from '../../../../../helpers/index.js';
import BaseComponentSnippet from './snippets/base-component.snippet.json' with { type: 'json' };
import ComponentSnippet from './snippets/component.snippet.json' with { type: 'json' };
import ViewSnippet from './snippets/view.snippet.json' with { type: 'json' };
import ServiceSnippet from './snippets/service.snippet.json' with { type: 'json' };
import BaseClassesSection from './base-classes.section.json' with { type: "json" };

export default BuildSectionHelper.buildSection(
	BaseClassesSection, 
	[
		BaseComponentSnippet,
		ComponentSnippet,
		ViewSnippet,
		ServiceSnippet
	]
);
