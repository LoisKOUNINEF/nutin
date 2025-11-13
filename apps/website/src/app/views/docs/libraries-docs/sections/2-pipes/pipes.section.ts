import { BuildSectionHelper } from '../../../../../helpers/index.js';
import DefaultPipesSnippet from './snippets/default-pipes.snippet.json' with { type: 'json' };
import CustomPipesSnippet from './snippets/custom-pipes.snippet.json' with { type: 'json' };
import UsageSnippet from './snippets/usage.snippet.json' with { type: 'json' };
import PipesSection from './pipes.section.json' with { type: "json" };

export default BuildSectionHelper.buildSection(
	PipesSection, 
	[
		DefaultPipesSnippet,
		CustomPipesSnippet,
		UsageSnippet,
	]
);
