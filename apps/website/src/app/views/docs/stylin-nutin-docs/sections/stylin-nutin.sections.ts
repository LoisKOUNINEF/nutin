import { BuildSectionHelper, sortById } from '../../../../helpers/index.js';
import ClassesSection from './1-classes/classes.section.json' with { type: 'json' };
import ClassesSnippet from './1-classes/snippets/classes.snippet.json' with { type: 'json' };
import MixinsSection from './2-mixins/mixins.section.json' with { type: "json" };
import MixinsSnippet from './2-mixins/snippets/mixins.snippet.json' with { type: 'json' };

export default sortById(BuildSectionHelper.buildSectionBatch([
	{
	section: MixinsSection,
	snippets: [MixinsSnippet]
	},
	{
	section: ClassesSection,
	snippets: [ClassesSnippet]
	},
]));
