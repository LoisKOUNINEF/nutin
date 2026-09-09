import { ResourceView } from '../resource/resource.view.class.js';
import { ArticlesManifestService } from '../../services/index.js';

const template = `__TEMPLATE_PLACEHOLDER__`;

export class ArticlesView extends ResourceView {
  constructor() {
    super({ manifest: ArticlesManifestService, routePrefix: 'articles', template, viewName: 'articles' });
  }
}
