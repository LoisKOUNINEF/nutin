import { Navigation, Component } from '../../../../core/index.js';

const templateFn = () => `__TEMPLATE_PLACEHOLDER__`;

export class NavbarComponent extends Component<HTMLHeadingElement> {
  private readonly dropdownClass = 'navbar__dropdown-visible' as const;

  constructor(mountTarget: HTMLElement) {
    super({templateFn, mountTarget, tagName: 'header'});
  }

  private _navigateTo(href: string): void {
    Navigation.navigateTo(href);
  }
}
