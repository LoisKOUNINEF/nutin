import { normalizeString } from '../../helpers/index.js';
import { AppEventBus, BaseButton, Component, ComponentConfig } from '../../../core/index.js';
import { ButtonComponent } from '../index.js';

interface ISidebarConfig {
  sections: ISection[];
  viewName: string;
}

const templateFn = () => `__TEMPLATE_PLACEHOLDER__`;

export class SidebarComponent extends Component {
  private _sections: ISection[];
  private _viewName: string;

  constructor(mountTarget: HTMLElement, config: ISidebarConfig ) {
    super({templateFn, mountTarget});
    this._sections = config.sections;
    this._viewName = config.viewName;
  }

  private nestSections(section: ISection): string {
    const btnClassPadding = 'nest-sections';
    const match = section.id.toString().match(/\d+(?:\.\d+)+/);

    if (match) {
      return btnClassPadding;
/*
// To handle deeply nested sections with 'styles' BaseButton property

  const dotCount = (match[0].match(/\./g) || []).length;
  return `padding: ${dotCount}rem;`; 
*/ 
    }

    return '';
  }

  private createSidebarButtons(): BaseButton[] {
    const btnClass = 'c-block-btn u-bg-inherit u-marg-y-small u-marg-x-small u-rounded';

    return this._sections.map((section) => ({
      textContent: `${section.id}- ${section.name}`, 
      callback:  () => this.navigateToTopic(section.name), 
      className: this.nestSections(section) + ' ' + btnClass
    }));
  }

  public childConfigs(): ComponentConfig[] {
    return this.catalogConfig({
      array: this.createSidebarButtons(),
      elementName: `${this._viewName}-sidebar-element`,
      selector: 'resource-sidebar',
      component: ButtonComponent,
    });
  }

  private navigateToTopic(name: ISection['name']) {
    const normalizedName = normalizeString(name);
    AppEventBus.emit('navigate', `/${this._viewName}/${normalizedName}`);
    window.scrollTo({ top: 0 });
  }
}
