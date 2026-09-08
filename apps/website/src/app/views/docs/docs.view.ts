import { ResourceView } from '../resource/resource.view.class.js';
import { DocsManifestService } from '../../services/index.js';

const template = `__TEMPLATE_PLACEHOLDER__`;

export class DocsView extends ResourceView {
  constructor() {
    super({ manifest: DocsManifestService, routePrefix: 'docs', template, viewName: 'docs' });
  }
}
