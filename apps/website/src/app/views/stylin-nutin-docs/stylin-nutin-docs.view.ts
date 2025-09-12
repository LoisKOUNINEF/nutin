import { TopicView } from '../resource/topic.view.class.js';
import StylinNutinSections from './sections/stylin-nutin-sections.js';

const template = `__TEMPLATE_PLACEHOLDER__`;

export class StylinNutinDocsView extends TopicView {
  protected sections: ISection[] = StylinNutinSections;
  protected sectionsIndexSelector = 'stylin-nutin-sidebar';
  protected sectionComponentSelector = 'stylin-nutin-topic';

  constructor() {
    super({template});
  }

}
