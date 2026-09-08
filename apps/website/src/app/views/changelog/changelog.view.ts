import { ResourceView } from '../resource/resource.view.class.js';
import { ChangelogManifestService } from '../../services/index.js';

const template = `__TEMPLATE_PLACEHOLDER__`;

export class ChangelogView extends ResourceView {
  constructor() {
    super({ manifest: ChangelogManifestService, routePrefix: 'changelog', template, viewName: 'changelog' });
  }
}
