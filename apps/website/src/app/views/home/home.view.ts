import { AppEventBus, ComponentConfig, View } from '../../../core/index.js';
import { ButtonComponent, SnippetComponent } from '../../components/index.js';

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
        className: 'u-rounded u-bold u-italic u-font-large u-color-bg u-bg-primary u-padd-y-medium u-padd-x-medium'
      })
    },{
      selector: 'snippet',
      factory: (el) => new SnippetComponent(el, {
        id: 0,
        sectionId: 0,
        content: 'npm i -g @nutin/cli\n\nnutin-new',
        type: 'none'
      })
    }]
  }

  goToTutorial() {
    AppEventBus.emit('navigate', 'tutorial');
    window.scrollTo({ top: 0 });
  }
}
