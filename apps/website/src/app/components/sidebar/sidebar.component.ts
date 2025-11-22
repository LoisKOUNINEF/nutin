import { normalizeString } from '../../helpers/index.js';
import { AppEventBus, BaseButton, Component, ComponentConfig, IAnchorConfig } from '../../../core/index.js';
import { AnchorComponent, ButtonComponent } from '../index.js';

interface ISidebarConfig {
  sections: ISection[];
  viewName: string;
  externalHref: string;
  hrefI18nKey: string;
  routeParams: Record<string, string>;
}

const templateFn = (_config: ISidebarConfig) => `__TEMPLATE_PLACEHOLDER__`;

export class SidebarComponent extends Component {
  private _sections: ISection[];
  private _viewName: string;
  private _externalHref: string;
  private _hrefI18nKey: string;
  private _routeParams: Record<string, string>;
  private readonly btnClass = 'c-block-btn c-round-btn sidebar__btn';

  constructor(mountTarget: HTMLElement, config: ISidebarConfig ) {
    super({templateFn, mountTarget, config});
    this._sections = config.sections;
    this._viewName = config.viewName;
    this._externalHref = config.externalHref;
    this._hrefI18nKey = config.hrefI18nKey;
    this._routeParams = config.routeParams;
  }

  private createSidebarButtons(): BaseButton[] {
    return this._sections.map((section) => {
      const className = this.highlightCurrent(section) ?? this.btnClass;
      return {
        textContent: `${section.id}- ${section.name}`, 
        callback:  () => this.navigateToTopic(section.name), 
        className: className
      }
    });
  }

  private highlightCurrent(section: ISection): string | undefined {
    const highlightClass = `${this.btnClass} sidebar__current-btn`;
    const normalizedName = section.name.split(' ').join('-').toLowerCase();
    const isCurrent = this._routeParams['topic']?.includes(normalizedName);
    const hasNoTopic = !this._routeParams['topic'];

    if (isCurrent) return highlightClass;
    if (hasNoTopic && section.id === 1) return highlightClass;
    return;
  }

  private anchor(): ComponentConfig {
    const anchorConfig: IAnchorConfig = {
      href: this._externalHref,
      i18nKey: this._hrefI18nKey,
      target: '_blank',
      className: `${this.btnClass} u-italic`,
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
