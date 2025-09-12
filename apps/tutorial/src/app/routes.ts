import { Routes } from "../core/index.js";
import { NotFoundView, TaskCatalogView } from "./views/index.js";

export const appRoutes: Routes = {
  '/': () => new TaskCatalogView(),
  '/tasks/:id?': () => new TaskCatalogView(),
  '/404': () => new NotFoundView(),
}
