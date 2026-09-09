import { Routes } from "../core/index.js";
import {
  ArticlesView,
  ChangelogView,
  DocsView,
  HomeView,
  NotFoundView,
  TutorialView
} from "./views/index.js";
import {
  ArticlesManifestService,
  ChangelogManifestService,
  DocsManifestService,
  TutorialManifestService
} from "./services/index.js";
import { Guards } from "./guards.js";

export const appRoutes: Routes = {
  '/': () => new HomeView(),
  '/docs/:slug?': { view: () => new DocsView(), guards: [Guards.resourcePageExists(DocsManifestService)] },
  '/tutorial/:slug?': { view: () => new TutorialView(), guards: [Guards.resourcePageExists(TutorialManifestService)] },
  '/changelog/:slug?': { view: () => new ChangelogView(), guards: [Guards.resourcePageExists(ChangelogManifestService)] },
  '/articles/:slug?': { view: () => new ArticlesView(), guards: [Guards.resourcePageExists(ArticlesManifestService)] },
  '/404': () => new NotFoundView(),
}
