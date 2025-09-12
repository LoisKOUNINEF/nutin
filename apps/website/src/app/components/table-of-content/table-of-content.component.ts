import { Component, ComponentConfig, IAnchorConfig } from '../../../core/index.js';
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
      style: 'color:inherit;',
      pipes: 'capitalizeAll'
    }));
  }

  public childConfigs(): ComponentConfig[] {
    return this.catalogConfig({
      array: this.createAnchorConfigs(),
      elementName: 'anchor',
      selector: 'table-of-content',
      component: AnchorComponent,
    });
  }
}
