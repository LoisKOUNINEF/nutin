import { Navigation, View, html } from '../../../core/index.js';
import { SnippetComponent } from '../../components/snippet/snippet.component.js';
import { HomeExtrasComponent } from '../../components/home-extras/home-extras.component.js';
import { loadA11yCardLink } from '../../helpers/a11y-elements/load-a11y-elements.helper.js';

const template = html`__TEMPLATE_PLACEHOLDER__`;

export class HomeView extends View {
  constructor() {
    super({template, viewName: 'home'});
  }

  // Client-only (never during SSR): the extras cards are <a11y-card-link>.
  public onEnter(): void {
    void loadA11yCardLink();
  }

  public registerChildren(): ComponentConfig[] {
    return [
      this.getExtrasConfig(),
      ...this.getSnippetsConfig(),
    ]
  }

  private getExtrasConfig(): ComponentConfig {
    return {
      selector: 'home-extras',
      factory: (el) => new HomeExtrasComponent(el)
    }
  }

  private getSnippetsConfig(): ComponentConfig[] {
    return [{
      selector: 'snippet-create',
      factory: (el) => new SnippetComponent(el, {
        id: 0,
        sectionId: 0,
        content: 'npx @nutin/cli my-app',
        type: 'bash',
      })
    },{
      selector: 'snippet-run',
      factory: (el) => new SnippetComponent(el, {
        id: 0,
        sectionId: 0,
        content: 'cd my-app\nnpm run serve # port 9090',
        type: 'bash',
      })
    },{
      selector: 'snippet-generate',
      factory: (el) => new SnippetComponent(el, {
        id: 0,
        sectionId: 0,
        content: 'npm run generate component components/hello-world',
        type: 'bash',
      })
    },{
      selector: 'snippet-hello',
      factory: (el) => new SnippetComponent(el, {
        id: 0,
        sectionId: 0,
        content: '<!-- components/hello-world/hello-world.component.html -->\n<div>Hello, world!</div>',
        type: 'html',
      })
    },{
      selector: 'snippet-register-ts',
      factory: (el) => new SnippetComponent(el, {
        id: 0,
        sectionId: 0,
        content: `// views/home/home.view.ts
import { HelloWorldComponent } from '../../components/hello-world/hello-world.component.js';

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
      })
    },{
      selector: 'snippet-register-html',
      factory: (el) => new SnippetComponent(el, {
        id: 0,
        sectionId: 0,
        content: `<!-- views/home/home.view.html -->
<!-- ... -->
<div data-component="hello"></div>`,
        type: 'html',
      })
    },{
      selector: 'snippet-see',
      factory: (el) => new SnippetComponent(el, {
        id: 0,
        sectionId: 0,
        content: 'npm run dev # port 9090 - watch mode',
        type: 'bash',
      })
    }]
  }

  private navigateTo(name: string) {
    Navigation.navigateTo(`/${name}`);
  }
}
