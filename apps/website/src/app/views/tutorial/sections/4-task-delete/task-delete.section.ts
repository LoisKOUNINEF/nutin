import { sectionManager } from '../../../../helpers/index.js';
import TaskDeleteSnippets from './snippets/task-delete.snippets.js';
import TaskDeleteSection from './task-delete.section.json' with { type: "json" };

export default sectionManager(TaskDeleteSection, TaskDeleteSnippets);
