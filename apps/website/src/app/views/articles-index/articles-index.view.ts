import { View, ComponentConfig } from '../../../core/index.js';
import { ReadMoreComponent } from '../../components/index.js';
import { loadA11yFocusable } from '../../helpers/index.js';

const template = `__TEMPLATE_PLACEHOLDER__`;

export class ArticlesIndexView extends View {
  constructor() {
    super({ template, viewName: 'articles-index' });
  }

  // Client-only (never during SSR): the read-more cards are <a11y-focusable>.
  public onEnter(): void {
    loadA11yFocusable();
  }

  public registerChildren(): ComponentConfig[] {
    return [{
      selector: 'read-more',
      factory: (el) => new ReadMoreComponent(el)
    }];
  }

}
