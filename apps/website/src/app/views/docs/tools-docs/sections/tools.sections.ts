import { sortById } from '../../../../helpers/index.js';
import BuilderSection from './1-builder/builder.section.js';
import GeneratorSection from './2-generator/generator.section.js';
import DevServerSection from './3-dev-server/dev-server.section.js';

export default sortById([
	BuilderSection,
	GeneratorSection,
	DevServerSection,
]);
