import { BuildSectionHelper } from '../../../../../helpers/index.js';
import DevSection from './dev.section.json' with { type: "json" };
import ServeSnippet from './snippets/serve.snippet.json' with { type: "json" };
import DevServeSnippet from './snippets/dev-serve.snippet.json' with { type: "json" };

export default BuildSectionHelper.buildSection(
	DevSection, 
	[ServeSnippet, DevServeSnippet]
);
