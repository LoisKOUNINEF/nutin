import { TopicView } from "../resource/topic.view.class.js";
import LibrariesSections from "./sections/libraries-sections.js";

const template = `__TEMPLATE_PLACEHOLDER__`;

export class LibrariesDocsView extends TopicView {
  protected sections: ISection[] = LibrariesSections;
  protected sectionsIndexSelector = 'libraries-sidebar';
  protected sectionComponentSelector = 'libraries-topic';

  constructor() {
    super({template});
  }

}
