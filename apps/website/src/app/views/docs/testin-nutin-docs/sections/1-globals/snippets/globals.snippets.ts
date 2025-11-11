import { snippetsManager } from '../../../../../../helpers/index.js';
import AssertionsSnippet from './assertions.snippet.json' with { type: 'json' };
import LifecycleHooksSnippet from './lifecycle-hooks.snippet.json' with { type: 'json' };
import StructureSnippet from './structure.snippet.json' with { type: 'json' };


export default snippetsManager([
	AssertionsSnippet,
	LifecycleHooksSnippet,
	StructureSnippet,
]);
