import { sortById } from '../../../../helpers/index.js';
import BaseClassesSection from './1-base-classes/base-classes.section.js';
import ServicesSection from './2-services/services.section.js';
 import DataAttributesSection from './3-data-attributes/data-attributes.section.js';

export default sortById([
	BaseClassesSection, 
	ServicesSection,
	DataAttributesSection,
]);
