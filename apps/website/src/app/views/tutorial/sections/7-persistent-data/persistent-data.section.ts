import { sectionManager } from '../../../../helpers/index.js';
import PersistentDataSnippets from './snippets/persistent-data.snippets.js';
import PersistentDataSection from './persistent-data.section.json' with { type: "json" };

export default sectionManager(PersistentDataSection, PersistentDataSnippets);
