import { BuildSectionHelper } from '../../../../helpers/index.js';
import TaskCatalogViewSnippet from './snippets/task-catalog-view.snippet.json' with { type: "json" };
import AddTaskComponentTemplateSnippet from './snippets/add-task-component-template.snippet.json' with { type: "json" };
import AddTaskComponentSnippet from './snippets/add-task-component.snippet.json' with { type: "json" };
import AddTaskStyleSnippet from './snippets/add-task-style.snippet.json' with { type: "json" };
import TaskServiceSnippet from './snippets/task-service.snippet.json' with { type: "json" };
import EventBusSnippet from './snippets/event-bus.snippet.json' with { type: "json" };
import TaskCreateSection from './task-create.section.json' with { type: "json" };

export default BuildSectionHelper.buildSection(
	TaskCreateSection, 
	[
		TaskCatalogViewSnippet,
		AddTaskComponentTemplateSnippet,
		AddTaskComponentSnippet,
		AddTaskStyleSnippet,
		TaskServiceSnippet,
		EventBusSnippet
	]
);
