import { appRoutes } from '#root/dist/src/app/routes.js';
import {
  A11yElementsView,
  ArticlesIndexView,
  ArticlesView,
  ChangelogView,
  DocsView,
  GuidesView,
  HomeView,
  NotFoundView,
  RoadmapView,
  TutorialView,
} from '#root/dist/src/app/views/index.js';

const EXPECTED = {
  '/': HomeView,
  '/docs/:section?/:slug?': DocsView,
  '/guides/:slug?': GuidesView,
  '/tutorial/:slug?': TutorialView,
  '/changelog/:slug?': ChangelogView,
  '/articles/:slug?': ArticlesView,
  '/articles-index': ArticlesIndexView,
  '/a11y-elements/:page?': A11yElementsView,
  '/roadmap/:slug?': RoadmapView,
  '/404': NotFoundView,
};

const GUARDED = ['/docs/:section?/:slug?', '/guides/:slug?', '/tutorial/:slug?', '/changelog/:slug?', '/articles/:slug?', '/roadmap/:slug?'];

const viewFactory = (route) => (typeof route === 'function' ? route : route.view);

describe('appRoutes', () => {
  beforeAll(() => {
    setupJsdom();
  });

  it('declares exactly the expected paths', () => {
    expect(Object.keys(appRoutes).sort()).toEqual(Object.keys(EXPECTED).sort());
  });

  it('builds the matching view for every path', () => {
    Object.entries(EXPECTED).forEach(([path, ViewClass]) => {
      expect(viewFactory(appRoutes[path])()).toBeInstanceOf(ViewClass);
    });
  });

  it('guards every resource route with one page-exists guard', () => {
    GUARDED.forEach((path) => {
      expect(appRoutes[path].guards.length).toBe(1);
      expect(typeof appRoutes[path].guards[0]).toBe('function');
    });
  });
});
