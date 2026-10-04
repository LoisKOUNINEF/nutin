import { TaskCatalogView, NotFoundView } from './views/index.js';

export const appRoutes: Routes = {
  '/': () => new TaskCatalogView(),
  '/tasks/:id?': () => new TaskCatalogView(),
  '/404': () => new NotFoundView(),
}
