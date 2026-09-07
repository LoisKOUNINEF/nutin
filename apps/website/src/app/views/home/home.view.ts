import { Navigation, ComponentConfig, View } from '../../../core/index.js';
import { ButtonComponent, SnippetComponent, HomePillarsComponent } from '../../components/index.js';

const template = `__TEMPLATE_PLACEHOLDER__`;

export class HomeView extends View {
  constructor() {
    super({template, viewName: 'home'});
  }

  public registerChildren(): ComponentConfig[] {
    return [{
      selector: 'tutorial-link',
      factory: (el) => new ButtonComponent(el , {
        i18nKey: 'home.tutorial-link',
        callback: () => this.navigateTo('tutorial'),
        className: 'home__cta-row-btn-primary card pillar-card arrow-top-right-svg'
      })
    },{
      selector: 'docs-link',
      factory: (el) => new ButtonComponent(el , {
        i18nKey: 'home.docs-link',
        callback: () => this.navigateTo('docs'),
        className: 'home__cta-row-btn-secondary card pillar-card arrow-top-right-svg'
      })
    },{
      selector: 'home-pillars',
      factory: (el) => new HomePillarsComponent(el)
    },
    ...this.getSnippetsConfig()]
  }

  private getSnippetsConfig(): ComponentConfig[] {
    return [{
      selector: 'snippet-create',
      factory: (el) => new SnippetComponent(el, {
        id: 0,
        sectionId: 0,
        content: 'npx @nutin/cli my-app',
        type: 'bash',
      },
      { className: 'snippet__code' })
    },{
      selector: 'snippet-run',
      factory: (el) => new SnippetComponent(el, {
        id: 0,
        sectionId: 0,
        content: 'cd my-app\nnpm run serve # app is reachable on port 9090',
        type: 'bash',
      },
      { className: 'snippet__code' })
    },{
      selector: 'snippet-generate',
      factory: (el) => new SnippetComponent(el, {
        id: 0,
        sectionId: 0,
        content: 'npm run generate component hello-world',
        type: 'bash',
      },
      { className: 'snippet__code' })
    },{
      selector: 'snippet-hello',
      factory: (el) => new SnippetComponent(el, {
        id: 0,
        sectionId: 0,
        content: '&lt;!-- components/hello-world/hello-world.component.html --&gt;\n&lt;div&gt;Hello, world!&lt;/div&gt;',
        type: 'html',
      },
      { className: 'snippet__code' })
    },{
      selector: 'snippet-register-ts',
      factory: (el) => new SnippetComponent(el, {
        id: 0,
        sectionId: 0,
        content: `// views/home/home.view.ts
class HomeView extends View {
  /* ... */

  registerChildren(): ComponentConfig[] {
    return [
      {
        selector: 'hello',
        factory: (el) => new HelloWorldComponent(el),
      }
    ]
  }
}`,
        type: 'ts',
      },
      { className: 'snippet__code' })
    },{
      selector: 'snippet-register-html',
      factory: (el) => new SnippetComponent(el, {
        id: 0,
        sectionId: 0,
        content: `&lt;!-- views/home/home.view.html --&gt;
&lt;!-- ... --&gt;
&lt;div data-component="hello"&gt;&lt;/div&gt;`,
        type: 'html',
      },
      { className: 'snippet__code' })
    },{
      selector: 'snippet-see',
      factory: (el) => new SnippetComponent(el, {
        id: 0,
        sectionId: 0,
        content: 'npm run dev # live reload on changes',
        type: 'bash',
      },
      { className: 'snippet__code' })
    }]
  }

  private navigateTo(name: string) {
    Navigation.navigateTo(`/${name}`);
  }
}
