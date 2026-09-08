import { RouteGuard } from '../core/index.js';
import { ResourceManifest } from './services/index.js';

export const Guards = {
  resourcePageExists: (manifest: ResourceManifest<any>): RouteGuard => {
    return (params) => {
      if (!manifest.hasPages) return true;
      const slug = params.slug || manifest.firstSlug;
      return (!!slug && !!manifest.getPage(slug)) || '/404';
    };
  },
};
