import { sectionManager } from '../../../../helpers/index.js';
import TaskDetailsSnippets from './snippets/task-details.snippets.js';
import TaskDetailsSection from './task-details.section.json' with { type: "json" };

export default sectionManager(TaskDetailsSection, TaskDetailsSnippets);
