import TaskCatalogViewSnippet from './task-catalog-view.snippet.json' with { type: "json" };
import AddTaskComponentSnippet from './add-task-component.snippet.json' with { type: "json" };
import AddTaskStyleSnippet from './add-task-style.snippet.json' with { type: "json" };
import TaskServiceSnippet from './task-service.snippet.json' with { type: "json" };
import { snippetsManager } from '../../../../../helpers/index.js';

export default snippetsManager([
	TaskCatalogViewSnippet,
	AddTaskComponentSnippet,
	TaskServiceSnippet,
	AddTaskStyleSnippet
]);
