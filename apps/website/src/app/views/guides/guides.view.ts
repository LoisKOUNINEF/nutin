import { ResourceView } from '../resource/resource.view.class.js';
import { GuidesManifestService } from '../../services/index.js';

const template = `__TEMPLATE_PLACEHOLDER__`;

export class GuidesView extends ResourceView {
  constructor() {
    super({ manifest: GuidesManifestService, routePrefix: 'guides', template, viewName: 'guides' });
  }
}
