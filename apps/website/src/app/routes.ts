import { A11yElementsView, ArticlesIndexView, HomeView, NotFoundView } from './views/index.js';
import { MarkdownPageView } from './views/markdown-page/markdown-page.view.js';
import { markdownRoutes } from './markdown/markdown-routes.js';

export const appRoutes: Routes = {
  '/': () => new HomeView(),
  // docs, changelog, tutorial, articles, guides: see nutin.config.js "markdownSources".
  ...markdownRoutes({ view: (id) => new MarkdownPageView(id) }),
  '/articles-index': () => new ArticlesIndexView(),
  '/a11y-elements/:page?': () => new A11yElementsView(),
  '/404': () => new NotFoundView(),
}
