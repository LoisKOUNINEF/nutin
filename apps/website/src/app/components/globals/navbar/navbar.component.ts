import { Navigation, Component, ComponentConfig } from '../../../../core/index.js';
import { BaseButton } from '../../../../libs/index.js';
import { ButtonComponent } from '../../index.js';

const templateFn = () => `__TEMPLATE_PLACEHOLDER__`;

export class NavbarComponent extends Component<HTMLHeadingElement> {
  private readonly fixedLinks = [
    'tutorial',
    'docs',
    'changelog'
  ] as const;
  private readonly btnClass = 'c-round-btn' as const;
  private readonly dropdownClass = 'navbar__dropdown-visible' as const;

  constructor(mountTarget: HTMLElement) {
    super({templateFn, mountTarget, tagName: 'header'});
  }

  registerChildren(): ComponentConfig[] {
    const fixedButtons = this.createFixedButtons();
    return [ ...fixedButtons ];
  }

  private createFixedButtons(): ComponentConfig[] {
    const fixedButtons: ComponentConfig[] = this.fixedLinks.map((name) =>{
      return {
          selector: name,
          factory: (el) => new ButtonComponent(el, this.getBtnConfig(name))
        }
      }
    )
    return [ ...fixedButtons ]
  }

  private getBtnConfig(name: string): BaseButton {
    const btnClass = this.btnClass;

    return { 
      i18nKey: `navbar.${name}`, 
      callback: () => this.handleNavigation(name), 
      className: btnClass
    }
  }

  private handleNavigation(path: string) {
    const navigateTo = this.returnUrl(path);
    Navigation.navigateTo(`/${navigateTo}`);
  }

  private returnUrl(path: string): string {
    if (path === 'home') return '';
    return path;
  }
}
