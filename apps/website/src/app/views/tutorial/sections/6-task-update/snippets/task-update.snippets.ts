import taskDetailsComponent from './task-details-component.json' with { type: "json" };
import taskService from './task-service.json' with { type: "json" };
import taskDetailsTemplate from './task-details-template.json' with { type: "json" };
import styles from './styles.json' with { type: "json" };
import { snippetsManager } from '../../../../../helpers/index.js';

const taskUpdateLocalizedSnippets: LocalizedSnippet[] = [];

taskUpdateLocalizedSnippets.push(
	taskDetailsComponent,
	taskService,
	taskDetailsTemplate,
	styles,
);

const TaskUpdateSnippets: ISnippet[] = snippetsManager(taskUpdateLocalizedSnippets);

export default TaskUpdateSnippets;
