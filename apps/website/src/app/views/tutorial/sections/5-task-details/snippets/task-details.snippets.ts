import taskDetailsComponent from './task-details-component.json' with { type: "json" };
import taskComponent from './task-component.json' with { type: "json" };
import taskCatalogView from './task-catalog-view.json' with { type: "json" };
import taskComponentStyle from './task-component-style.json' with { type: "json" };
import taskCatalogViewStyle from './task-catalog-view-style.json' with { type: "json" };
import routes from './routes.json' with { type: "json" };
import { snippetsManager } from '../../../../../helpers/index.js';

const taskDetailsLocalizedSnippets: LocalizedSnippet[] = [];

taskDetailsLocalizedSnippets.push(
	taskDetailsComponent,
	taskComponent,
	taskCatalogView,
	routes,
	taskComponentStyle,
	taskCatalogViewStyle,
);

const TaskDetailsSnippets: ISnippet[] = snippetsManager(taskDetailsLocalizedSnippets);

export default TaskDetailsSnippets;
