import { Component, ComponentConfig, Navigation } from '../../../../core/index.js';
import { SnippetComponent } from '../../snippet/snippet.component.js';

const templateFn = () => `__TEMPLATE_PLACEHOLDER__`;

const SNIPPETS: Record<string, Pick<ISnippet, 'content' | 'type'>> = {
  'snippet-zero-build': {
    type: 'html',
    content: `&lt;link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/a11y-elements/dist/a11y.css"&gt;
&lt;script type="module" src="https://cdn.jsdelivr.net/npm/a11y-elements/dist/browser/accessibility-components/spinner/define.js"&gt;&lt;/script&gt;

&lt;a11y-spinner label="Saving…"&gt;&lt;/a11y-spinner&gt;`,
  },
  'snippet-bundler': {
    type: 'ts',
    content: `import 'a11y-elements/a11y.css';
import 'a11y-elements/accessibility-components/checkbox';
import 'a11y-elements/overlays/modal';
import type { CheckboxElement } from 'a11y-elements/accessibility-components/checkbox/element';

const checkbox = document.querySelector('a11y-checkbox') as CheckboxElement;
checkbox.onChange = (checked) =&gt; console.log('accepted:', checked);`,
  },
  'snippet-styling': {
    type: 'css',
    content: `/* retheme every checkbox on the page */
:root {
  --a11y-checkbox-color-primary: #16a34a;
}

/* or scope a token to one instance */
.theme-danger {
  --a11y-spinner-color: #dc2626;
}`,
  },
};

export class A11yElementsIndexComponent extends Component {
  constructor(mountTarget: HTMLElement) {
    super({templateFn, mountTarget});
  }

  public registerChildren(): ComponentConfig[] {
    return Object.entries(SNIPPETS).map(([selector, snippet]) => ({
      selector,
      factory: (el) => new SnippetComponent(el, { id: 0, sectionId: 0, ...snippet }),
    }));
  }

  private navigateTo(page: string) {
    Navigation.navigateTo(`/a11y/${page}`);
  }
}
