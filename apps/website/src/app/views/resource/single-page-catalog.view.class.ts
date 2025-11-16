import { ResourceView } from './resource.view.class.js';
import { ComponentConfig } from '../../../core/index.js';
import { SectionComponent, TableOfContentComponent } from '../../components/index.js';

export abstract class SinglePageCatalogView extends ResourceView {
  protected tocHref: string | undefined;

  private renderSinglePage(): ComponentConfig[] {
    return [ 
      ...this.renderTableOfContent(), 
      ...this.renderCatalog()
    ]
  }

  private renderTableOfContent(): ComponentConfig[] {
    return [
      {
        selector: this.sectionsIndexSelector,
        factory: (el) => new TableOfContentComponent(el, this.sections)
      }
    ]
  }

  private renderCatalog(): ComponentConfig[] {
    const sectionsWithAnchor = this.sections.map((section) => {
      return {
        section: section, 
        catalogTocHref: this.tocHref,
      }
    });
    return this.catalogConfig({
      array: sectionsWithAnchor,
      elementName: 'section',
      selector: this.sectionComponentSelector,
      component: SectionComponent
    });
  }

  public childConfigs(): ComponentConfig[] {
    return this.renderSinglePage();
  }
}
