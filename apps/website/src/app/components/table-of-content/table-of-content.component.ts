import { Component, ComponentConfig } from '../../../core/index.js';
import { IAnchorConfig } from '../../../libs/index.js';
import { AnchorComponent } from '../index.js';

const templateFn = () => `__TEMPLATE_PLACEHOLDER__`;

export class TableOfContentComponent extends Component {
  private _sections: ISection[];

  constructor(mountTarget: HTMLElement, sections: ISection[]) {
    super({templateFn, mountTarget});
    this._sections = sections;
  }

  private createAnchorConfigs(): IAnchorConfig[] {
    return this._sections.map((section) => ({
      href: `#section${section.id}`,
      textContent: `${section.id}- ${section.name}`, 
      className: 'table-of-content__anchors',
      pipes: 'capitalizeAll'
    }));
  }

  public registerChildren(): ComponentConfig[] {
    return this.createCatalogComponents({
      items: this.createAnchorConfigs(),
      elementName: 'anchor',
      selector: 'table-of-content',
      component: AnchorComponent,
    });
  }
}
