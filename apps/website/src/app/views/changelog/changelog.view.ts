import { SinglePageCatalogView } from '../resource/single-page-catalog.view.class.js';
import changelogSections from './sections/changelog.sections.js';

const template = `__TEMPLATE_PLACEHOLDER__`;

export class ChangelogView extends SinglePageCatalogView {
  protected sections: ISection[] = changelogSections;
  protected sectionComponentSelector: string = 'section-catalog';
  protected sectionsIndexSelector: string = '';

  constructor() {
    super({template});
  }

}
