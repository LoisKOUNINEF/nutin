import { View, html } from '../../../core/index.js';
import { ReadMoreComponent } from '../../components/read-more/read-more.component.js';
import { loadA11yCardLink } from '../../helpers/a11y-elements/load-a11y-elements.helper.js';

const template = html`__TEMPLATE_PLACEHOLDER__`;

export class ArticlesIndexView extends View {
  constructor() {
    super({ template, viewName: 'articles-index' });
  }

  // Client-only (never during SSR): the read-more cards are <a11y-card-link>.
  public override onEnter(): void {
    void loadA11yCardLink();
  }

  public override registerChildren(): Nutin.ComponentConfig[] {
    return [{
      selector: 'read-more',
      factory: (el) => new ReadMoreComponent(el)
    }];
  }

}
