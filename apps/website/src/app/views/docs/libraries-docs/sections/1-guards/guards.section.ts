import { sectionManager } from '../../../../../helpers/index.js';
import GuardsSnippets from './snippets/guards.snippets.js';
import GuardsSection from './guards.section.json' with { type: "json" };

export default sectionManager(GuardsSection, GuardsSnippets);

