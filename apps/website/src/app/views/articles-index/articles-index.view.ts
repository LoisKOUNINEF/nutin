import { View, ComponentConfig } from '../../../core/index.js';
import { ReadMoreComponent } from '../../components/index.js';

const template = `__TEMPLATE_PLACEHOLDER__`;

export class ArticlesIndexView extends View {
  constructor() {
    super({ template, viewName: 'articles-index' });
  }

  public registerChildren(): ComponentConfig[] {
    return [{
      selector: 'read-more',
      factory: (el) => new ReadMoreComponent(el)
    }];
  }

}
