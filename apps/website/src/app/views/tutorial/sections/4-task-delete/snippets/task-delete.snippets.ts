import { snippetsManager } from '../../../../../helpers/index.js';
import taskComponent from './task-component.json' with { type: "json" };
import taskService from './task-service.json' with { type: "json" };
import taskComponentStyle from './task-component-style.json' with { type: "json" };

const taskDeleteLocalizedSnippets: LocalizedSnippet[] = [];

taskDeleteLocalizedSnippets.push(
	taskComponent,
	taskService,
	taskComponentStyle
);

const TaskDeleteSnippets: ISnippet[] = snippetsManager(taskDeleteLocalizedSnippets);

export default TaskDeleteSnippets;
