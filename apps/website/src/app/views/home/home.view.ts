import { AppEventBus, ComponentConfig, View } from '../../../core/index.js';
import { ButtonComponent } from '../../components/index.js';

const template = `__TEMPLATE_PLACEHOLDER__`;

export class HomeView extends View {
  constructor() {
    super({template});
  }

  childConfigs(): ComponentConfig[] {
    return [{
      selector: 'tutorial-link',
      factory: (el) => new ButtonComponent(el, {
        callback: () => this.goToTutorial(),
        i18nKey: 'home.tutorial-link',
        className: 'u-rounded u-italic u-color-bg u-bg-primary u-font-bold u-padd-y-medium u-padd-x-medium'
      })
    }]
  }

  goToTutorial() {
    AppEventBus.emit('navigate', 'tutorial');
    window.scrollTo({ top: 0 });
  }
}
