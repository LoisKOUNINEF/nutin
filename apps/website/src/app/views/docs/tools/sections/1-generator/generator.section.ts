import { BuildSectionHelper } from '../../../../../helpers/index.js';
import GeneratorSection from './generator.section.json' with { type: "json" };
import GeneratorSnippet from './snippets/generator.snippet.json' with { type: "json" };

export default BuildSectionHelper.buildSection(GeneratorSection, [GeneratorSnippet]);
