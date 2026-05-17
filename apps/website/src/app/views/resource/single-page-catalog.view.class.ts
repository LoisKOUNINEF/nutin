import { ResourceView } from './resource.view.class.js';
import { ComponentConfig } from '../../../core/index.js';
import { SectionComponent, TableOfContentComponent } from '../../components/index.js';

export abstract class SinglePageCatalogView extends ResourceView {
  protected tocHref: string | undefined;

  private renderTableOfContent(): ComponentConfig {
    return {
      selector: this.sectionsIndexSelector,
      factory: (el) => new TableOfContentComponent(el, this.sections)
    }
  }

  private renderCatalog(): ComponentConfig[] {
    const sectionsWithAnchor = this.sections.map((section, index) => {
      return {
        section: section, 
        catalogTocHref: this.tocHref,
        index: index,
      }
    });
    return this.catalogConfig({
      array: sectionsWithAnchor,
      elementName: `${this.viewName}-${this.sectionComponentSelector}-section`,
      selector: this.sectionComponentSelector,
      component: SectionComponent,
    });
  }

  public childConfigs(): ComponentConfig[] {
    return [ 
      this.renderTableOfContent(), 
      ...this.renderCatalog()
    ]
  }
}
