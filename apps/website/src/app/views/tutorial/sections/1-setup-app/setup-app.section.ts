import { sectionManager } from '../../../../helpers/index.js';
import SetupAppSnippets from './snippets/setup-app.snippets.js';
import setupAppSection from './setup-app.json' with { type: "json" };

const SetupAppSection: ISection = sectionManager(setupAppSection, SetupAppSnippets);

export default SetupAppSection;
