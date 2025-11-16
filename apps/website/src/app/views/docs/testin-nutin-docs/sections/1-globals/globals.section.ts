import { BuildSectionHelper } from '../../../../../helpers/index.js';
import AssertionsSnippet from './snippets/assertions.snippet.json' with { type: 'json' };
import LifecycleHooksSnippet from './snippets/lifecycle-hooks.snippet.json' with { type: 'json' };
import StructureSnippet from './snippets/structure.snippet.json' with { type: 'json' };
import SpyonSnippet from './snippets/spyon.snippet.json' with { type: 'json' };
import JsdomSnippet from './snippets/jsdom.snippet.json' with { type: 'json' };
import GlobalsSection from './globals.section.json' with { type: "json" };

export default BuildSectionHelper.buildSection(
	GlobalsSection, 
	[
		AssertionsSnippet,
		LifecycleHooksSnippet,
		StructureSnippet,
		SpyonSnippet,
		JsdomSnippet
	]
);
