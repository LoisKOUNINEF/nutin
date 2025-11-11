import { sectionManager } from '../../../../../helpers/index.js';
import MixinsSnippets from './snippets/mixins.snippets.js';
import MixinsSection from './mixins.section.json' with { type: "json" };

export default sectionManager(MixinsSection, MixinsSnippets);
