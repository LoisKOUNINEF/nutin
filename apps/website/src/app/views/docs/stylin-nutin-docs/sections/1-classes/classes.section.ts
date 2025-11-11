import { sectionManager } from '../../../../../helpers/index.js';
import ClassesSnippets from './snippets/classes.snippets.js';
import ClassesSection from './classes.section.json' with { type: "json" };

export default sectionManager(ClassesSection, ClassesSnippets);
