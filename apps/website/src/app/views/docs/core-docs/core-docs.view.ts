import { TopicView } from "../../resource/topic.view.class.js";
import CoreSections from "./sections/core.sections.js";

const template = `__TEMPLATE_PLACEHOLDER__`;

export class CoreDocsView extends TopicView {
  protected sections: ISection[] = CoreSections;
  protected sectionsIndexSelector = 'core-sidebar';
  protected sectionComponentSelector = 'core-topic';

  constructor() {
    super({template});
  }
}
