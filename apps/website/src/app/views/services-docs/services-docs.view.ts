import { TopicView } from "../resource/topic.view.class.js";
import ServicesSections from "./sections/services-sections.js";

const template = `__TEMPLATE_PLACEHOLDER__`;

export class ServicesDocsView extends TopicView {
  protected sections: ISection[] = ServicesSections;
  protected sectionsIndexSelector = 'services-sidebar';
  protected sectionComponentSelector = 'services-topic';

  constructor() {
    super({template});
  }

}
