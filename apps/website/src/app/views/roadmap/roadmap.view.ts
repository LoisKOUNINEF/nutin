import { ResourceView } from '../resource/resource.view.class.js';
import { RoadmapManifestService } from '../../services/index.js';

const template = `__TEMPLATE_PLACEHOLDER__`;

export class RoadmapView extends ResourceView {
  constructor() {
    super({ manifest: RoadmapManifestService, routePrefix: 'roadmap', template, viewName: 'roadmap' });
  }

}
