import { ResourceManifest } from '../resource-manifest/resource-manifest.service.js';

export class ArticlesManifest extends ResourceManifest<ArticlesManifest> {
  constructor() {
    super('/generated/articles.json');
  }
}

export const ArticlesManifestService = ArticlesManifest.getInstance();
