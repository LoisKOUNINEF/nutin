import { snippetsManager } from '../../../../../helpers/index.js';
import NotifySnippet from './notify.snippet.json' with { type: "json" };
import PopoverSnippet from './popover.snippet.json' with { type: "json" };

export default snippetsManager([ NotifySnippet, PopoverSnippet ]);
