import { ResourceManifest } from '../resource-manifest/resource-manifest.service.js';

export class ChangelogManifest extends ResourceManifest<ChangelogManifest> {
  constructor() {
    super('/generated/changelog.json');
  }
}

export const ChangelogManifestService = ChangelogManifest.getInstance();
