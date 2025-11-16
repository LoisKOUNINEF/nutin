import { BuildSectionHelper } from '../../../../helpers/index.js';
import TaskDetailsComponentSnippet from './snippets/task-details-component.snippet.json' with { type: "json" };
import TaskServiceSnippet from './snippets/task-service.snippet.json' with { type: "json" };
import TaskDetailsTemplateSnippet from './snippets/task-details-template.snippet.json' with { type: "json" };
import StylesSnippet from './snippets/styles.snippet.json' with { type: "json" };
import TaskUpdateSection from './task-update.section.json' with { type: "json" };

export default BuildSectionHelper.buildSection(
	TaskUpdateSection, 
	[
		TaskDetailsComponentSnippet,
		TaskServiceSnippet,
		TaskDetailsTemplateSnippet,
		StylesSnippet,
	]
);
