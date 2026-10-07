import { TaskCatalogView } from './views/task-catalog/task-catalog.view.js';
import { NotFoundView } from './views/not-found/not-found.view.js';
import { Guards } from './guards.js';

export const appRoutes: Routes = {
  '/': () => new TaskCatalogView(),
  '/tasks/:id?': { view: () => new TaskCatalogView(), guards: [Guards.requireTask()] },
  '/404': () => new NotFoundView(),
}
