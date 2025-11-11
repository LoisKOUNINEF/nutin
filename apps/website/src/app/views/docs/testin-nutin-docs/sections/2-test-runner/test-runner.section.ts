import { sectionManager } from '../../../../../helpers/index.js';
import TestRunnerSnippets from './snippets/test-runner.snippets.js';
import TestRunnerSection from './test-runner.section.json' with { type: "json" };

export default sectionManager(TestRunnerSection, TestRunnerSnippets);
