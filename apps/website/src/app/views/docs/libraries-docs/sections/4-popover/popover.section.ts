import { sectionManager } from '../../../../../helpers/index.js';
import PopoverSnippets from './snippets/popover.snippets.js';
import PopoverSection from './popover.section.json' with { type: "json" };

export default sectionManager(PopoverSection, PopoverSnippets);
