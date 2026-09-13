import { ResourceManifest } from '../resource-manifest/resource-manifest.service.js';

export class GuidesManifest extends ResourceManifest<GuidesManifest> {  
  constructor() {
    super('/generated/guides.json');
  }

}

export const GuidesManifestService = GuidesManifest.getInstance();
