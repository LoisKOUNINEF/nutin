import { AppEventBus, ComponentConfig, View } from '../../../core/index.js';
import { ButtonComponent } from '../../components/index.js';

const template = `__TEMPLATE_PLACEHOLDER__`;

export class NotFoundView extends View {
  constructor() {
    super({template});
  }

  childConfigs(): ComponentConfig[] {
    const btnClass = 'u-bg-inherit u-font-large u-padd-y-medium u-color-prim u-italic';
    return [
      { 
        selector: 'home',
        factory: (el) => new ButtonComponent(el, { i18nKey: 'not-found.redirect', callback: () => this.handleHome(), className: btnClass })
      },
    ]
  }

  handleHome() {
    AppEventBus.emit('navigate', '/');
  }
}
