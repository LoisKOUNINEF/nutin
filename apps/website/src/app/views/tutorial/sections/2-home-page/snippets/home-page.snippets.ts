import TaskCatalogViewSnippet from './task-catalog-view.snippet.json' with { type: "json" };
import TaskComponentSnippet from './task-component.snippet.json' with { type: "json" };
import TaskServiceSnippet from './task-service.snippet.json' with { type: "json" };
import TaskInterfaceSnippet from './task-interface.snippet.json' with { type: "json" };
import RoutesSnippet from './routes.snippet.json' with { type: "json" };
import { snippetsManager } from '../../../../../helpers/index.js';

export default snippetsManager([
	TaskCatalogViewSnippet,
	TaskComponentSnippet,
	TaskServiceSnippet,
	TaskInterfaceSnippet,
	RoutesSnippet
]);
