import { SinglePageCatalogView } from '../resource/single-page-catalog.view.class.js';
import { hideGlobals, revealGlobals } from '../../../core/index.js';
import changelogSections from './sections/changelog.sections.js';

const template = `__TEMPLATE_PLACEHOLDER__`;

export class ChangelogView extends SinglePageCatalogView {
  protected sections: ISection[] = changelogSections;
  protected sectionComponentSelector: string = 'changelog-sections';
  protected sectionsIndexSelector: string = '';

  constructor() {
    super({template});
  }

  onBeforeRender() {
    hideGlobals(['under-development']);
  }

  onBeforeDestroy() {
    revealGlobals(['under-development']);
  }

}
