import { sortById } from '../../../../helpers/index.js';
import BaseClassesSection from './2-base-classes/base-classes.section.js';
import ServicesSection from './3-services/services.section.js';
 import DataAttributesSection from './1-data-attributes/data-attributes.section.js';

export default sortById([
	BaseClassesSection, 
	ServicesSection,
	DataAttributesSection,
]);
