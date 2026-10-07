import { HomeView } from './views/home/home.view.js';
import { NotFoundView } from './views/not-found/not-found.view.js';
import { markdownRoutes } from './markdown/markdown-routes.js';

// Home and 404 are in the main bundle; every other view is lazy (its own chunk, loaded on
// the first visit). Views are imported by their own file, never through views/index.ts or
// components/index.ts: a barrel would pull every view and component back into the bundle.
export const appRoutes: Routes = {
  '/': () => new HomeView(),
  // docs, changelog, tutorial, articles, guides: see nutin.config.js "markdownSources".
  ...markdownRoutes({
    view: (id) => import('./views/markdown-page/markdown-page.view.js').then((m) => new m.MarkdownPageView(id)),
  }),
  '/articles-index': () => import('./views/articles-index/articles-index.view.js').then((m) => new m.ArticlesIndexView()),
  '/a11y-elements/:page?': () => import('./views/a11y-elements/a11y-elements.view.js').then((m) => new m.A11yElementsView()),
  '/404': () => new NotFoundView(),
}
