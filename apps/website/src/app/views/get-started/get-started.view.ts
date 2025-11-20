import { SinglePageCatalogView } from '../resource/single-page-catalog.view.class.js';
import GetStartedSection from './sections/get-started.section.js';

const template = `__TEMPLATE_PLACEHOLDER__`;

export class GetStartedView extends SinglePageCatalogView {
  protected sections: ISection[] = GetStartedSection;
  protected sectionComponentSelector: string = 'section-catalog';
  protected sectionsIndexSelector: string = '';
  constructor() {
    super({template});
  }

}
