import { sortById } from '../../../../helpers/index.js';
import TestRunnerSection from './2-test-runner/test-runner.section.js';
import GlobalsSection from './1-globals/globals.section.js';

export default sortById([
	TestRunnerSection,
	GlobalsSection,
]);
