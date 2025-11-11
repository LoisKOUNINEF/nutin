import TaskDetailsComponentSnippet from './task-details-component.snippet.json' with { type: "json" };
import TaskServiceSnippet from './task-service.snippet.json' with { type: "json" };
import TaskDetailsTemplateSnippet from './task-details-template.snippet.json' with { type: "json" };
import StylesSnippet from './styles.snippet.json' with { type: "json" };
import { snippetsManager } from '../../../../../helpers/index.js';

export default snippetsManager([
	TaskDetailsComponentSnippet,
	TaskServiceSnippet,
	TaskDetailsTemplateSnippet,
	StylesSnippet,
]);
