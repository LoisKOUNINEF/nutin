import { normalizeString } from '../../helpers/index.js';
import { AppEventBus, BaseButton, Component, ComponentConfig, IAnchorConfig } from '../../../core/index.js';
import { AnchorComponent, ButtonComponent } from '../index.js';

interface ISidebarConfig {
  sections: ISection[];
  viewName: string;
  externalHref: string;
  hrefI18nKey: string;
}

const templateFn = () => `__TEMPLATE_PLACEHOLDER__`;

export class SidebarComponent extends Component {
  private _sections: ISection[];
  private _viewName: string;
  private _externalHref: string;
  private _hrefI18nKey: string;

  constructor(mountTarget: HTMLElement, config: ISidebarConfig ) {
    super({templateFn, mountTarget});
    this._sections = config.sections;
    this._viewName = config.viewName;
    this._externalHref = config.externalHref;
    this._hrefI18nKey = config.hrefI18nKey;
  }

  private createSidebarButtons(): BaseButton[] {
    const btnClass = 'c-block-btn u-bg-inherit u-marg-y-small u-marg-x-small u-rounded';

    return this._sections.map((section) => ({
      textContent: `${section.id}- ${section.name}`, 
      callback:  () => this.navigateToTopic(section.name), 
      className: btnClass
    }));
  }

  private anchor(): ComponentConfig {
    const anchorConfig: IAnchorConfig = {
      href: this._externalHref,
      i18nKey: this._hrefI18nKey,
      target: '_blank',
      className: 'c-block-btn u-marg-y-small u-marg-x-small u-italic u-padd-x-small',
      tagName: 'aside',
    }

    return  {
      selector: 'anchor',
      factory: (el) => new AnchorComponent(el, anchorConfig)
    };
  }

  public childConfigs(): ComponentConfig[] {
    const catalogConfigs = this.catalogConfig({
      array: this.createSidebarButtons(),
      elementName: `${this._viewName}-sidebar-element`,
      selector: 'resource-sidebar',
      component: ButtonComponent,
    });

    return [ ...catalogConfigs, this.anchor() ]
  }

  private navigateToTopic(name: ISection['name']) {
    const normalizedName = normalizeString(name);
    AppEventBus.emit('navigate', `/${this._viewName}/${normalizedName}`);
    window.scrollTo({ top: 0 });
  }
}
