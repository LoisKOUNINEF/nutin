import { sectionManager } from '../../../../helpers/index.js';
import MixinsSnippets from './snippets/mixins.snippets.js';
import mixinsSection from './mixins.json' with { type: "json" };

const MixinsSection: ISection = sectionManager(mixinsSection, MixinsSnippets);

export default MixinsSection;
