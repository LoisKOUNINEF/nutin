import { TopicView } from '../../resource/topic.view.class.js';
import TestinNutinSections from './sections/testin-nutin.sections.js';

const template = `__TEMPLATE_PLACEHOLDER__`;

export class TestinNutinDocsView extends TopicView {
  protected sections: ISection[] = TestinNutinSections;
  protected sectionsIndexSelector = 'testin-nutin-sidebar';
  protected sectionComponentSelector = 'testin-nutin-topic';

  constructor() {
    super({template});
  }
}
