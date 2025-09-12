import taskCatalogView from './task-catalog-view.json' with { type: "json" };
import taskComponent from './task-component.json' with { type: "json" };
import taskService from './task-service.json' with { type: "json" };
import taskInterface from './task-interface.json' with { type: "json" };
import routes from './routes.json' with { type: "json" };
import { snippetsManager } from '../../../../../helpers/index.js';

const taskCatalogViewLocalizedSnippets: LocalizedSnippet[] = [];

taskCatalogViewLocalizedSnippets.push(
	taskCatalogView,
	taskComponent,
	taskService,
	taskInterface,
	routes
);

const TaskCatalogViewSnippets: ISnippet[] = snippetsManager(taskCatalogViewLocalizedSnippets);

export default TaskCatalogViewSnippets;
