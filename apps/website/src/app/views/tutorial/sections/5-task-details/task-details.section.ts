import { sectionManager } from '../../../../helpers/index.js';
import TaskDetailsSnippets from './snippets/task-details.snippets.js';
import taskDetailsSection from './task-details.json' with { type: "json" };

const TaskDetailsSection: ISection = sectionManager(taskDetailsSection, TaskDetailsSnippets);

export default TaskDetailsSection;
