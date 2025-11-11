import { sectionManager } from '../../../../../helpers/index.js';
import ServicesSnippets from './snippets/services.snippets.js';
import ServicesSection from './services.section.json' with { type: "json" };

export default sectionManager(ServicesSection, ServicesSnippets);
