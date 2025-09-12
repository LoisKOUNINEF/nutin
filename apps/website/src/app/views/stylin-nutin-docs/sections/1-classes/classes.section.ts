import { sectionManager } from '../../../../helpers/index.js';
import ClassesSnippets from './snippets/classes.snippets.js';
import classesSection from './classes.json' with { type: "json" };

const ClassesSection: ISection = sectionManager(classesSection, ClassesSnippets);

export default ClassesSection;
