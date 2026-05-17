import { Component, ComponentConfig, IAnchorConfig } from '../../../core/index.js';
import { AnchorComponent, SnippetComponent } from '../index.js';

const templateFn = (_config: ISectionConfig) => `__TEMPLATE_PLACEHOLDER__`;

interface ISectionConfig {
  section: ISection;
  catalogTocHref?: string;
  index?: number;
}

export class SectionComponent extends Component {
  private _section: ISection;
  private _catalogTocHref: string | undefined;
  private _index: number | undefined;

  constructor(
    mountTarget: HTMLElement, 
    config: ISectionConfig, 
  ) {
    super({
      templateFn, 
      mountTarget, 
      config: config, 
      tagName: 'article',
    });
    this._section = config.section;
    this._catalogTocHref = config.catalogTocHref;
    this._index = config.index;
  }

  private anchor(): ComponentConfig {
    const anchorConfig: IAnchorConfig = {
      href: `#${this._catalogTocHref}`,
      i18nKey: 'section.back-to-toc', 
    }

    return  {
      selector: `anchor-${this._section.id}`,
      factory: (el) => new AnchorComponent(el, anchorConfig)
    };
  }

  public childConfigs(): ComponentConfig[] {
    const catalogConfigs =  this.catalogConfig({
      array: this._section.snippets,
      elementName: `snippet-${this._section.id}`,
      selector: `snippet-container-${this._section.id}`,
      component: SnippetComponent
    });

    if (this._catalogTocHref) {
      catalogConfigs.push(this.anchor());
    }

    return catalogConfigs;
  }

}
