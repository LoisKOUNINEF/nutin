import { sectionManager } from '../../../../helpers/index.js';
import TaskCreateSnippets from './snippets/task-create.snippets.js';
import taskCreateSection from './task-create.json' with { type: "json" };

const TaskCreateSection: ISection = sectionManager(taskCreateSection, TaskCreateSnippets);

export default TaskCreateSection;
