import { BuildSectionHelper } from '../../../../../helpers/index.js';
import RunTestSnippet from './snippets/run-tests.snippet.json' with { type: 'json' };
import ConfigSnippet from './snippets/config.snippet.json' with { type: 'json' }
import TestRunnerSection from './test-runner.section.json' with { type: "json" };

export default BuildSectionHelper.buildSection(
	TestRunnerSection,
	[
		RunTestSnippet,
		ConfigSnippet,
	]
);