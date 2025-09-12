import { snippetsManager } from '../../../../../helpers/index.js';
import mixins from './mixins.json' with { type: 'json' };

const mixinsLocalizedSnippets: LocalizedSnippet[] = [];

mixinsLocalizedSnippets.push(mixins); 

const MixinsSnippets: ISnippet[] = snippetsManager(mixinsLocalizedSnippets);

export default MixinsSnippets;
