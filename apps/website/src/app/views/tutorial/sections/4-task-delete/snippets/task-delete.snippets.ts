import { snippetsManager } from '../../../../../helpers/index.js';
import TaskComponentSnippet from './task-component.snippet.json' with { type: "json" };
import TaskServiceSnippet from './task-service.snippet.json' with { type: "json" };
import TaskComponentStyleSnippet from './task-component-style.snippet.json' with { type: "json" };

export default snippetsManager([
	TaskComponentSnippet,
	TaskServiceSnippet,
	TaskComponentStyleSnippet
]);
