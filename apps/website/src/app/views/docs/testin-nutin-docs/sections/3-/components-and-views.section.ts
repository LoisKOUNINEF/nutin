import { sectionManager } from '../../../../../helpers/index.js';
import ComponentSnippets from './snippets/components-and-views.snippets.js';
import componentsSection from './components-and-views.json' with { type: "json" };

const ComponentSection = sectionManager(componentsSection, ComponentSnippets);

export default ComponentSection;
