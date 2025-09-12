import { sectionManager } from '../../../../helpers/index.js';
import TaskDeleteSnippets from './snippets/task-delete.snippets.js';
import taskDeleteSection from './task-delete.json' with { type: "json" };

const TaskDeleteSection: ISection = sectionManager(taskDeleteSection, TaskDeleteSnippets);

export default TaskDeleteSection;
