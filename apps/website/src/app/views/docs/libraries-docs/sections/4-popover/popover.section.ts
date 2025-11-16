import { BuildSectionHelper } from '../../../../../helpers/index.js';
import StyleSnippet from './snippets/style.snippet.json' with { type: 'json'};
import UsageSnippet from './snippets/usage.snippet.json' with { type: 'json'};
import PopoverSection from './popover.section.json' with { type: "json" };

export default BuildSectionHelper.buildSection(
	PopoverSection,
	[
		StyleSnippet,
		UsageSnippet,
	]
);
