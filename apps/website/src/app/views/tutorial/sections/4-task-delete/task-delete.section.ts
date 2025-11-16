import { BuildSectionHelper } from '../../../../helpers/index.js';
import TaskComponentSnippet from './snippets/task-component.snippet.json' with { type: "json" };
import TaskServiceSnippet from './snippets/task-service.snippet.json' with { type: "json" };
import TaskComponentStyleSnippet from './snippets/task-component-style.snippet.json' with { type: "json" };
import TaskDeleteSection from './task-delete.section.json' with { type: "json" };

export default BuildSectionHelper.buildSection(
	TaskDeleteSection, 
	[
		TaskComponentSnippet,
		TaskServiceSnippet,
		TaskComponentStyleSnippet,
	]
);
