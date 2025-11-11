import { sectionManager } from '../../../../helpers/index.js';
import TaskUpdateSnippets from './snippets/task-update.snippets.js';
import TaskUpdateSection from './task-update.section.json' with { type: "json" };

export default sectionManager(TaskUpdateSection, TaskUpdateSnippets);
