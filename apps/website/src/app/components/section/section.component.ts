import { Component, ComponentConfig, IAnchorConfig } from '../../../core/index.js';
import { AnchorComponent, SnippetComponent } from '../index.js';

const templateFn = (_section: ISection) => `__TEMPLATE_PLACEHOLDER__`;

interface ISectionConfig {
  section: ISection;
  catalogTocHref?: string;
}

export class SectionComponent extends Component {
  private _section: ISection;
  private _catalogTocHref: string | undefined;

  constructor(
    mountTarget: HTMLElement, 
    config: ISectionConfig, 
    className?: string
  ) {
    super({
      templateFn, 
      mountTarget, 
      config: config.section, 
      tagName: 'article', 
      props: { className: className }
    });
    this._section = config.section;
    this._catalogTocHref = config.catalogTocHref;
  }

  private anchorToTop(): ComponentConfig {
    const anchorConfig: IAnchorConfig = {
      href: ('#' + this._catalogTocHref) || '',
      i18nKey: 'section.back-to-toc'
    };
    return  {
      selector: 'anchor-to-top',
      factory: (el) => new AnchorComponent(el, anchorConfig)
    };
  }

  public childConfigs(): ComponentConfig[] {
    const catalogConfigs =  this.catalogConfig({
      array: this._section.snippets,
      elementName: 'snippet',
      selector: `snippet-container-${this._section.id}`,
      component: SnippetComponent
    });

    if (this._catalogTocHref) {
      return [ this.anchorToTop(), ...catalogConfigs ];
    }

    return catalogConfigs;
  }

}
