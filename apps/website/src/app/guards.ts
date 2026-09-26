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

  // For section-scoped resources ('/docs/:section?/:slug?'). A bare
  // '/docs/<slug>' (pre-section URL, still indexed) redirects to its section.
  sectionPageExists: (manifest: ResourceManifest<any>, routePrefix: string): RouteGuard => {
    return (params) => {
      if (!manifest.hasPages || !params.section) return true;

      if (manifest.getSection(params.section)) {
        if (!params.slug) return true;
        return manifest.getPage(params.slug)?.section === params.section || '/404';
      }

      const legacyPage = !params.slug ? manifest.getPage(params.section) : undefined;
      return legacyPage ? `/${routePrefix}/${legacyPage.section}/${legacyPage.slug}` : '/404';
    };
  },
};
