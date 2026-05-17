import { SinglePageCatalogView } from '../resource/single-page-catalog.view.class.js';
import TutorialSections from './sections/tutorial.sections.js';

const template = `__TEMPLATE_PLACEHOLDER__`;

export class TutorialView extends SinglePageCatalogView {
  protected sections: ISection[] = TutorialSections;
  protected sectionsIndexSelector = 'tutorial-table-of-content';
  protected sectionComponentSelector = 'tutorial-sections';
  protected tocHref = 'tutorial-toc';

  constructor() {
    super({template});
  }
}
