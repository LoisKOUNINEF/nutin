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

  constructor(mountTarget: HTMLElement) {
    super({templateFn, mountTarget, tagName: 'header'});
  }

  childConfigs(): ComponentConfig[] {
    const dropdownButtonsCatalog = this.getDropdownButtonsCatalog();
    const fixedButtons = [
      this.createFixedButton('home'),
      this.createFixedButton('tutorial'),
      this.createDropdownButton()
    ];
    return [ ...fixedButtons, ...dropdownButtonsCatalog ];
  }

  private createFixedButton(name: string): ComponentConfig {
    return {
      selector: name,
      factory: (el) => new ButtonComponent(el, this.getBtnConfig(name))
    }
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
    const navigateTo = this.returnUrl(path);
    AppEventBus.emit('navigate', `/${navigateTo}`);
    const isDocs = navigateTo.includes('docs');
    this.toggleDropdown(isDocs);
  }

  private returnUrl(path: string): string {
    if (path === 'home') return '';
    if (path === 'tutorial') return path;
    return `${path}-docs`; 
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
    const dropdownButtons = this.createDropdownButtons();
    return this.catalogConfig({
        array: dropdownButtons,
        selector: 'dropdown-buttons',
        component: ButtonComponent,
        elementName: 'dropdown-btn'
    });
  }

  private createDropdownButtons(): BaseButton[] {
    return this.dropdownLinks.map((link) => {
      return this.getBtnConfig(link);
    });
  }
}
