import { BuildSectionHelper } from '../../../../../helpers/index.js';
import GuardsLibrarySnippet from './snippets/guards-library.snippet.json' with { type: 'json' };
import UsageSnippet from './snippets/usage.snippet.json' with { type: 'json' };
import GuardsSection from './guards.section.json' with { type: "json" };

export default BuildSectionHelper.buildSection(
	GuardsSection,
	[
		GuardsLibrarySnippet,
		UsageSnippet,
	]
);

