import { TopicView } from "../resource/topic.view.class.js";
import ToolsSections from "./sections/tools-sections.js";

const template = `__TEMPLATE_PLACEHOLDER__`;

export class ToolsDocsView extends TopicView {
  protected sections: ISection[] = ToolsSections;
  protected sectionsIndexSelector = 'tools-sidebar';
  protected sectionComponentSelector = 'tools-topic';

  constructor() {
    super({template});
  }

}
