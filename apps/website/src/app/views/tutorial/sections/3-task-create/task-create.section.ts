import { sectionManager } from '../../../../helpers/index.js';
import TaskCreateSnippets from './snippets/task-create.snippets.js';
import TaskCreateSection from './task-create.section.json' with { type: "json" };

export default sectionManager(TaskCreateSection, TaskCreateSnippets);
