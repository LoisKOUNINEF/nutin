import taskCatalogView from './task-catalog-view.json' with { type: "json" };
import addTaskComponent from './add-task-component.json' with { type: "json" };
import addTaskStyle from './add-task-style.json' with { type: "json" };
import taskService from './task-service.json' with { type: "json" };
import { snippetsManager } from '../../../../../helpers/index.js';

const taskCreateLocalizedSnippets: LocalizedSnippet[] = [];

taskCreateLocalizedSnippets.push(
	taskCatalogView,
	addTaskComponent,
	taskService,
	addTaskStyle
);

const TaskCreateSnippets: ISnippet[] = snippetsManager(taskCreateLocalizedSnippets);

export default TaskCreateSnippets;
