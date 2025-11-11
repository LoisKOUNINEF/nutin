import { sectionManager } from '../../../../../helpers/index.js';
import GeneratorSnippets from './snippets/generator.snippets.js';
import GeneratorSection from './generator.section.json' with { type: "json" };

export default sectionManager(GeneratorSection, GeneratorSnippets);
