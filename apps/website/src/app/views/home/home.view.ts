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
        className: 'home__tutorial-link'
      })
    },{
      selector: 'snippet',
      factory: (el) => new SnippetComponent(el, {
        id: 0,
        sectionId: 0,
        content: 'npx @nutin/cli',
        type: 'none'
      })
    }]
  }

  goToTutorial() {
    AppEventBus.emit('navigate', 'tutorial');
    window.scrollTo({ top: 0 });
  }
}
