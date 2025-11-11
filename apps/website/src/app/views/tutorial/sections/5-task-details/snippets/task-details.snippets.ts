import TaskDetailsComponentSnippet from './task-details-component.snippet.json' with { type: "json" };
import TaskComponentSnippet from './task-component.snippet.json' with { type: "json" };
import TaskCatalogViewSnippet from './task-catalog-view.snippet.json' with { type: "json" };
import TaskComponentStyleSnippet from './task-component-style.snippet.json' with { type: "json" };
import TaskCatalogViewStyleSnippet from './task-catalog-view-style.snippet.json' with { type: "json" };
import RoutesSnippet from './routes.snippet.json' with { type: "json" };
import { snippetsManager } from '../../../../../helpers/index.js';

export default snippetsManager([
	TaskDetailsComponentSnippet,
	TaskComponentSnippet,
	TaskCatalogViewSnippet,
	RoutesSnippet,
	TaskComponentStyleSnippet,
	TaskCatalogViewStyleSnippet,
]);
