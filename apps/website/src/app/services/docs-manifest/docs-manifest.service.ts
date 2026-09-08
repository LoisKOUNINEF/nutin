import { ResourceManifest } from '../resource-manifest/resource-manifest.service.js';

export class DocsManifest extends ResourceManifest<DocsManifest> {
  constructor() {
    super('/generated/docs.json');
  }
}

export const DocsManifestService = DocsManifest.getInstance();
