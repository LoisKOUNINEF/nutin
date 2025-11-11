import { sectionManager } from '../../../../helpers/index.js';
import HomePageSnippets from './snippets/home-page.snippets.js';
import HomePageSection from './home-page.section.json' with { type: "json" };

export default sectionManager(HomePageSection, HomePageSnippets);
