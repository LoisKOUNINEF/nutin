import { ResourceView } from '../resource/resource.view.class.js';
import { TutorialManifestService } from '../../services/index.js';

const template = `__TEMPLATE_PLACEHOLDER__`;

export class TutorialView extends ResourceView {
  constructor() {
    super({ manifest: TutorialManifestService, routePrefix: 'tutorial', template, viewName: 'tutorial' });
  }
}
