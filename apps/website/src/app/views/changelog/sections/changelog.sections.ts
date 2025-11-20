import { BuildSectionHelper } from '../../../helpers/index.js';
import FirstVersion from './1.0.1.section.json' with { type: 'json' };
import SecondVersion from './1.0.2.section.json' with { type: 'json' };
import ThirdVersion from './1.1.0.section.json' with { type: 'json' };
import ThirdVersionSnippet from './snippets/1.1.0.snippet.json' with { type: 'json' };
import FourthVersion from './1.2.0.section.json' with { type: 'json' };
import FifthVersion from './1.2.1.section.json' with { type: 'json' };
import SixthVersion from './1.2.2.section.json' with { type: 'json' };
import SeventhVersion from './1.2.3.section.json' with { type: 'json' };

export default BuildSectionHelper.buildSectionBatch([
  { section : FirstVersion },
  { section : SecondVersion },
  { section : ThirdVersion, snippets: [ThirdVersionSnippet] },
  { section : FourthVersion },
  { section : FifthVersion },
  { section : SixthVersion },
  { section : SeventhVersion },
]).reverse();
