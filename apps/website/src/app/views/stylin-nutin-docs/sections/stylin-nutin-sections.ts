import { sortById } from '../../../helpers/index.js';
import ClassesSection from './1-classes/classes.section.js';
import MixinsSection from './2-mixins/mixins.section.js';

const SectionsArray: ISection[] = [
	ClassesSection,
	MixinsSection,
];

const StylinNutinSections = sortById(SectionsArray);

export default StylinNutinSections;
