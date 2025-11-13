import { BuildSectionHelper } from '../../../../helpers/index.js';
import SetupCommandSnippet from './snippets/setup-command.snippet.json' with { type: "json" };
import CheckCommandSnippet from './snippets/check-command.snippet.json' with { type: "json" };
import SetupAppSection from './setup-app.section.json' with { type: "json" };

export default BuildSectionHelper.buildSection(
	SetupAppSection, 
	[
		SetupCommandSnippet,
		CheckCommandSnippet,
	]
);
