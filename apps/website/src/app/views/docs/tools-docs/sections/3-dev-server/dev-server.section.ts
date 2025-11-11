import { sectionManager } from '../../../../../helpers/index.js';
import ComponentSnippets from './snippets/dev-server.snippets.js';
import componentsSection from './dev-server.section.json' with { type: "json" };

export default sectionManager(componentsSection, ComponentSnippets);
