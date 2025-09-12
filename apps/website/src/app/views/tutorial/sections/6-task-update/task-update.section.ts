import { sectionManager } from '../../../../helpers/index.js';
import TaskUpdateSnippets from './snippets/task-update.snippets.js';
import taskUpdateSection from './task-update.json' with { type: "json" };

const TaskUpdateSection: ISection = sectionManager(taskUpdateSection, TaskUpdateSnippets);

export default TaskUpdateSection;
