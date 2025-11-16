import { sortById } from '../../../../helpers/index.js';
import BuilderSection from './2-builder/builder.section.js';
import GeneratorSection from './1-generator/generator.section.js';
import DevSection from './3-dev/dev.section.js';
import DeploymentSection from './4-deployment/deployment.section.js';

export default sortById([
	BuilderSection,
	GeneratorSection,
	DevSection,
	DeploymentSection
]);
