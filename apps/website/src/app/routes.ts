import { Routes } from "../core/index.js";
import {
  ChangelogView,
  DocsView,
  GetStartedView,
  HomeView,
  NotFoundView,
  TutorialView
} from "./views/index.js";
import { Guards } from "./guards.js";

export const appRoutes: Routes = {
  '/': () => new HomeView(),
  '/get-started': () => new GetStartedView(),
  '/tutorial': () => new TutorialView(),
  '/docs/:slug?': { view: () => new DocsView(), guards: [Guards.docPageExists()] },
  '/changelog': () => new ChangelogView(),
  '/404': () => new NotFoundView(),
}
