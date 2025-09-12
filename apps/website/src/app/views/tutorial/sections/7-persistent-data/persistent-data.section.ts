import { sectionManager } from '../../../../helpers/index.js';
import PersistentDataSnippets from './snippets/persistent-data.snippets.js';
import persistentDataSection from './persistent-data.json' with { type: "json" };

const PersistentDataSection: ISection = sectionManager(persistentDataSection, PersistentDataSnippets);

export default PersistentDataSection;
