import { sectionManager } from '../../../../../helpers/index.js';
import BuilderSnippets from './snippets/builder.snippets.js';
import BuilderSection from './builder.section.json' with { type: "json" };

export default sectionManager(BuilderSection, BuilderSnippets);
