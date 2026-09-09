import { ResourceManifest } from '../resource-manifest/resource-manifest.service.js';

export class TutorialManifest extends ResourceManifest<TutorialManifest> {
  constructor() {
    super('/generated/tutorial.json');
  }
}

export const TutorialManifestService = TutorialManifest.getInstance();
