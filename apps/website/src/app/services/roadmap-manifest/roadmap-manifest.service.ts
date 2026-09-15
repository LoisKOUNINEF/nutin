import { ResourceManifest } from '../resource-manifest/resource-manifest.service.js';

export class RoadmapManifest extends ResourceManifest<RoadmapManifest> {  
  constructor() {
    super('/generated/roadmap.json');
  }

}

export const RoadmapManifestService = RoadmapManifest.getInstance();
