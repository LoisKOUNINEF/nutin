import { sectionManager } from '../../../../helpers/index.js';
import HomePageSnippets from './snippets/home-page.snippets.js';
import homePageSection from './home-page.json' with { type: "json" };

const HomePageSection: ISection = sectionManager(homePageSection, HomePageSnippets);

export default HomePageSection;
