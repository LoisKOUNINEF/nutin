import { Routes } from "../core/index.js";
import {
  ArticlesView,
  ArticlesIndexView,
  ChangelogView,
  DocsView,
  GuidesView,
  HomeView,
  NotFoundView,
  TutorialView,
  RoadmapView
} from "./views/index.js";
import {
  ArticlesManifestService,
  ChangelogManifestService,
  DocsManifestService,
  GuidesManifestService,
  TutorialManifestService,
  RoadmapManifestService
} from "./services/index.js";
import { Guards } from "./guards.js";

export const appRoutes: Routes = {
  '/': () => new HomeView(),
  '/docs/:slug?': { view: () => new DocsView(), guards: [Guards.resourcePageExists(DocsManifestService)] },
  '/guides/:slug?': { view: () => new GuidesView(), guards: [Guards.resourcePageExists(GuidesManifestService)] },
  '/tutorial/:slug?': { view: () => new TutorialView(), guards: [Guards.resourcePageExists(TutorialManifestService)] },
  '/changelog/:slug?': { view: () => new ChangelogView(), guards: [Guards.resourcePageExists(ChangelogManifestService)] },
  '/articles/:slug?': { view: () => new ArticlesView(), guards: [Guards.resourcePageExists(ArticlesManifestService)] },
  '/articles-index': () => new ArticlesIndexView(),
  '/roadmap/:slug?': { view: () => new RoadmapView(), guards: [Guards.resourcePageExists(RoadmapManifestService)] },
  '/404': () => new NotFoundView(),
}
