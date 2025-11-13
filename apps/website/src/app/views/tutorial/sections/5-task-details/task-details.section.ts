import { BuildSectionHelper } from '../../../../helpers/index.js';
import TaskDetailsComponentSnippet from './snippets/task-details-component.snippet.json' with { type: "json" };
import TaskComponentSnippet from './snippets/task-component.snippet.json' with { type: "json" };
import TaskCatalogViewSnippet from './snippets/task-catalog-view.snippet.json' with { type: "json" };
import TaskComponentStyleSnippet from './snippets/task-component-style.snippet.json' with { type: "json" };
import TaskCatalogViewStyleSnippet from './snippets/task-catalog-view-style.snippet.json' with { type: "json" };
import RoutesSnippet from './snippets/routes.snippet.json' with { type: "json" };
import TaskDetailsSection from './task-details.section.json' with { type: "json" };

export default BuildSectionHelper.buildSection(
	TaskDetailsSection, 
	[
		TaskDetailsComponentSnippet,
		TaskCatalogViewSnippet,
		TaskComponentStyleSnippet,
		TaskCatalogViewStyleSnippet,
		RoutesSnippet
	]
);
