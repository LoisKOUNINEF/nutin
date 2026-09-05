import { RouteGuard } from '../core/index.js';
import { DocsManifestService } from './services/index.js';

export const Guards = {
  docPageExists: (): RouteGuard => {
    return (params) => {
      const slug = params.slug || DocsManifestService.firstSlug;
      return (!!slug && !!DocsManifestService.getPage(slug)) || '/404';
    };
  },
};
