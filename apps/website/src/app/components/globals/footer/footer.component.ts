import { ThemeTogglerService } from '../../../services/index.js';
import { Component } from '../../../../core/index.js';

const templateFn = () => `__TEMPLATE_PLACEHOLDER__`;

export class FooterComponent extends Component {
  constructor(mountTarget: HTMLElement) {
    super({templateFn, mountTarget, tagName: 'footer'});
  }

  private toggleTheme(): void {
    ThemeTogglerService.toggleTheme();
  }
}
