import { AppEventBus, ComponentConfig, View } from '../../../core/index.js';
import { ButtonComponent, HomeExtrasComponent, HomePhilosophyComponent, HomePillarsComponent, SnippetComponent } from '../../components/index.js';

const template = `__TEMPLATE_PLACEHOLDER__`;

export class HomeView extends View {
  constructor() {
    super({template});
  }

  public childConfigs(): ComponentConfig[] {
    return [{
      selector: 'tutorial-link',
      factory: (el) => new ButtonComponent(el, {
        callback: () => this.navigateTo('tutorial'),
        i18nKey: 'home.tutorial-link',
        className: 'home__tutorial-link'
      })
    },{
      selector: 'snippet',
      factory: (el) => new SnippetComponent(el, {
        id: 0,
        sectionId: 0,
        content: 'npx @nutin/cli',
        type: 'bash'
      })
    },
    {
      selector: 'cta-row-get-started-btn',
      factory: (el) => new ButtonComponent(el , {
        i18nKey: 'navbar.get-started',
        callback: () => this.navigateTo('get-started'),
        className: 'home__cta-row-btn-primary'
      })
    },
    {
      selector: 'cta-row-tutorial-btn',
      factory: (el) => new ButtonComponent(el , {
        i18nKey: 'navbar.tutorial',
        callback: () => this.navigateTo('tutorial'),
        className: 'home__cta-row-btn-secondary'
      })
    },
    ...this.getSectionsConfig(),]
  }

  private getSectionsConfig(): ComponentConfig[] {
    return [{
      selector: 'home-pillars',
      factory: (el) => new HomePillarsComponent(el)
    },{
      selector: 'home-philosophy',
      factory: (el) => new HomePhilosophyComponent(el)
    },{
      selector: 'home-extras',
      factory: (el) => new HomeExtrasComponent(el)
    }];
  }

  private navigateTo(name: string) {
    AppEventBus.emit('navigate', `/${name}`);
    window.scrollTo({ top: 0 });
  }
}
