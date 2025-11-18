import { AppEventBus, BaseButton, Component, ComponentConfig } from '../../../../core/index.js';
import { ButtonComponent } from '../../index.js';

const templateFn = () => `__TEMPLATE_PLACEHOLDER__`;

export class NavbarComponent extends Component<HTMLHeadingElement> {
  private readonly dropdownLinks = [
    'libraries',
    'stylin-nutin',
    'testin-nutin',
    'core',
    'tools'
  ] as const;

  private readonly fixedLinks = [
    'home',
    'tutorial',
    'get-started',
    'changelog'
  ] as const;

  constructor(mountTarget: HTMLElement) {
    super({templateFn, mountTarget, tagName: 'header'});
  }

  childConfigs(): ComponentConfig[] {
    const fixedButtons = this.createFixedButtons();
    const dropdownButtonsCatalog = this.getDropdownButtonsCatalog();
    return [ ...fixedButtons, ...dropdownButtonsCatalog ];
  }

  private createFixedButtons(): ComponentConfig[] {
    const fixedButtons: ComponentConfig[] = this.fixedLinks.map((name) =>{
      return {
          selector: name,
          factory: (el) => new ButtonComponent(el, this.getBtnConfig(name))
        }
      }
    )
    return [ ...fixedButtons, this.createDropdownButton() ]
  }

  private getBtnConfig(name: string): BaseButton {
    const btnClass = 'u-bg-inherit u-marg-y-small u-padd-x-small u-rounded';

    return { 
      i18nKey: `navbar.${name}`, 
      callback: () => this.handleNavigation(name), 
      className: btnClass
    }
  }

  private handleNavigation(path: string) {
    const isDocs = (this.dropdownLinks as ReadonlyArray<string>).includes(path);
    const navigateTo = this.returnUrl(path, isDocs);
    AppEventBus.emit('navigate', `/${navigateTo}`);
    this.toggleDropdown(isDocs);
  }

  private returnUrl(path: string, isDocs: boolean): string {
    if (path === 'home') return '';
    if (isDocs) return `${path}-docs`;
    return path;
  }

  private createDropdownButton(): ComponentConfig {
    const dropdownBtn = { 
      i18nKey: `navbar.documentation`, 
      callback: () => this.toggleDropdown(),
      className: 'u-bg-inherit u-marg-y-small u-padd-x-small u-rounded'
    };

    return {
      selector: 'extend-dropdown',
      factory: (el) => new ButtonComponent(el, dropdownBtn)
    }
  }

  private toggleDropdown(isDocs: boolean = true) {
    const dropdown = document.getElementById('dropdown');
    if (!isDocs) {
      dropdown?.classList.remove('navbar__dropdown-visible');
    } else {
      dropdown?.classList.toggle('navbar__dropdown-visible');
    }
  }

  private getDropdownButtonsCatalog(): ComponentConfig[] {
    const dropdownButtons = this.dropdownLinks.map((link) => {
      return this.getBtnConfig(link);
    });

    return this.catalogConfig({
        array: dropdownButtons,
        selector: 'dropdown-buttons',
        component: ButtonComponent,
        elementName: 'dropdown-btn'
    });
  }
}
