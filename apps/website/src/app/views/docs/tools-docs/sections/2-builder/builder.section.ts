import { BuildSectionHelper } from '../../../../../helpers/index.js';
import BuilderSection from './builder.section.json' with { type: "json" };
import CommandsSnippet from './snippets/commands.snippet.json' with { type: "json" };
import ConfigSnippet from './snippets/config.snippet.json' with { type: "json" };

export default BuildSectionHelper.buildSection(
	BuilderSection, [
		CommandsSnippet,
		ConfigSnippet,
	]
);
