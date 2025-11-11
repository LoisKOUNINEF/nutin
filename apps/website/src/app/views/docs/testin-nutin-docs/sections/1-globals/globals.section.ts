import { sectionManager } from '../../../../../helpers/index.js';
import GlobalsSnippets from './snippets/globals.snippets.js';
import GlobalsSection from './globals.section.json' with { type: "json" };

export default sectionManager(GlobalsSection, GlobalsSnippets);
