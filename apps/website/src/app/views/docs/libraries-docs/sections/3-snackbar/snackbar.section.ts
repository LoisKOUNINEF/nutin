import { BuildSectionHelper } from '../../../../../helpers/index.js';
import StyleSnippet from './snippets/style.snippet.json' with { type: 'json'};
import UsageSnippet from './snippets/usage.snippet.json' with { type: 'json'};
import SnackbarSection from './snackbar.section.json' with { type: "json" };

export default BuildSectionHelper.buildSection(
	SnackbarSection,
	[
		StyleSnippet,
		UsageSnippet,
	]
);
