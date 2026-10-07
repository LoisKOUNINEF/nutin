import { TaskCatalogView } from './views/task-catalog/task-catalog.view.js';
import { NotFoundView } from './views/not-found/not-found.view.js';

export const appRoutes: Routes = {
  '/': () => new TaskCatalogView(),
  '/tasks/:id?': () => new TaskCatalogView(),
  '/404': () => new NotFoundView(),
}
