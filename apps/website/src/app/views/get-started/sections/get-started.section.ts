import { BuildSectionHelper } from '../../../helpers/index.js';
import GetStartedSection from './get-started.section.json' with { type: 'json' };
import CreateAppSnippet from './snippets/create-app.snippet.json' with { type: 'json' };
import FolderStructureSnippet from './snippets/folder-structure.snippet.json' with { type: 'json' };
import InstallationSnippet from './snippets/installation.snippet.json' with { type: 'json' };
import ScriptsSnippet from './snippets/scripts.snippet.json' with { type: 'json' };

export default BuildSectionHelper.buildSection(
	GetStartedSection, 
	[
		CreateAppSnippet,
		FolderStructureSnippet,
		InstallationSnippet,
		ScriptsSnippet,
	]
);
