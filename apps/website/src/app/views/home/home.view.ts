import { Navigation, View, html } from '../../../core/index.js';
import { SnippetComponent, HomeExtrasComponent } from '../../components/index.js';
import { loadA11yFocusable } from '../../helpers/index.js';

const template = html`__TEMPLATE_PLACEHOLDER__`;

export class HomeView extends View {
  constructor() {
    super({template, viewName: 'home'});
  }

  // Client-only (never during SSR): the extras cards are <a11y-focusable>.
  public onEnter(): void {
    loadA11yFocusable();
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
