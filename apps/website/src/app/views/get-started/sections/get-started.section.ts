import { BuildSectionHelper } from '../../../helpers/index.js';
import InstallationSection from './installation.section.json' with { type: 'json' };
import CreateAppSection from './create-app.section.json' with { type: 'json' };
import ScriptsSection from './scripts.section.json' with { type: 'json' };
import FolderStructureSection from './folder-structure.section.json' with { type: 'json' };
import CreateAppSnippet from './snippets/create-app.snippet.json' with { type: 'json' };
import FolderStructureSnippet from './snippets/folder-structure.snippet.json' with { type: 'json' };
import InstallationSnippet from './snippets/installation.snippet.json' with { type: 'json' };
import ScriptsSnippet from './snippets/scripts.snippet.json' with { type: 'json' };

export default BuildSectionHelper.buildSectionBatch([
	{ section : CreateAppSection, snippets: [CreateAppSnippet] },
	{ section : FolderStructureSection, snippets: [FolderStructureSnippet] },
	{ section : InstallationSection, snippets: [InstallationSnippet] },
	{ section : ScriptsSection, snippets: [ScriptsSnippet] },
]);
