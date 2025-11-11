import { sectionManager } from '../../../../../helpers/index.js';
import PipesSnippets from './snippets/pipes.snippets.js';
import PipesSection from './pipes.section.json' with { type: "json" };

export default sectionManager(PipesSection, PipesSnippets);
