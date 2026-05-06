import { BuildSectionHelper } from '../../../../helpers/index.js';
import TaskCatalogViewTemplateSnippet from './snippets/task-catalog-view-template.snippet.json' with { type: "json" };
import TaskCatalogViewSnippet from './snippets/task-catalog-view.snippet.json' with { type: "json" };
import TaskComponentTemplateSnippet from './snippets/task-component-template.snippet.json' with { type: "json" };
import TaskComponentSnippet from './snippets/task-component.snippet.json' with { type: "json" };
import TaskServiceSnippet from './snippets/task-service.snippet.json' with { type: "json" };
import TaskInterfaceSnippet from './snippets/task-interface.snippet.json' with { type: "json" };
import RoutesSnippet from './snippets/routes.snippet.json' with { type: "json" };
import HomePageSection from './home-page.section.json' with { type: "json" };

export default BuildSectionHelper.buildSection(
	HomePageSection, 
	[
		TaskCatalogViewTemplateSnippet,
		TaskCatalogViewSnippet,
		TaskComponentTemplateSnippet,
		TaskComponentSnippet,
		TaskServiceSnippet,
		TaskInterfaceSnippet,
		RoutesSnippet
	]
);
