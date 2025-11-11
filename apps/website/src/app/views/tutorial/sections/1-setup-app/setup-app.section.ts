import { sectionManager } from '../../../../helpers/index.js';
import SetupAppSnippets from './snippets/setup-app.snippets.js';
import SetupAppSection from './setup-app.section.json' with { type: "json" };

export default sectionManager(SetupAppSection, SetupAppSnippets);
