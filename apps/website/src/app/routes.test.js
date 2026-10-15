import { appRoutes } from '#root/dist/src/app/routes.js';
import { A11yElementsView } from '#root/dist/src/app/views/a11y-elements/a11y-elements.view.js';
import { ArticlesIndexView } from '#root/dist/src/app/views/articles-index/articles-index.view.js';
import { HomeView } from '#root/dist/src/app/views/home/home.view.js';
import { NotFoundView } from '#root/dist/src/app/views/not-found/not-found.view.js';
import { MarkdownPageView } from '#root/dist/src/app/views/markdown-page/markdown-page.view.js';

const EXPECTED = {
  '/': HomeView,
  '/docs/:section?/:slug?': MarkdownPageView,
  '/guides/:slug?': MarkdownPageView,
  '/tutorial/:slug?': MarkdownPageView,
  '/changelog/:slug?': MarkdownPageView,
  '/articles/:slug?': MarkdownPageView,
  '/articles-index': ArticlesIndexView,
  '/a11y-elements/:page?': A11yElementsView,
  '/404': NotFoundView,
};

const GUARDED = ['/docs/:section?/:slug?', '/guides/:slug?', '/tutorial/:slug?', '/changelog/:slug?', '/articles/:slug?'];

const viewFactory = (route) => (typeof route === 'function' ? route : route.view);

describe('appRoutes', () => {
  beforeAll(() => {
    setupJsdom();
  });

  it('declares exactly the expected paths', () => {
    expect(Object.keys(appRoutes).sort()).toEqual(Object.keys(EXPECTED).sort());
  });

  it('builds the matching view for every path', async () => {
    for (const [path, ViewClass] of Object.entries(EXPECTED)) {
      expect(await viewFactory(appRoutes[path])()).toBeInstanceOf(ViewClass);
    }
  });

  it('keeps home and 404 in the main bundle and loads every other view lazily', async () => {
    for (const path of Object.keys(EXPECTED)) {
      const result = viewFactory(appRoutes[path])();
      expect(typeof result.then === 'function').toBe(path !== '/' && path !== '/404');
      (await result).destroy();
    }
  });

  it('guards every Markdown route with one page-exists guard', () => {
    GUARDED.forEach((path) => {
      expect(appRoutes[path].guards.length).toBe(1);
      expect(typeof appRoutes[path].guards[0]).toBe('function');
    });
  });

  it('renders articles without the Markdown nav', async () => {
    const view = await viewFactory(appRoutes['/articles/:slug?'])();
    view.render();
    expect($('[data-component="markdown-nav"], .markdown-nav')).toBe(null);
    view.destroy();
  });
});
