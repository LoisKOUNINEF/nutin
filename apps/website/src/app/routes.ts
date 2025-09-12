import { Routes } from "../core/index.js";
import { CoreDocsView, HomeView, LibrariesDocsView, NotFoundView, ServicesDocsView, StylinNutinDocsView, TestinNutinDocsView, ToolsDocsView, TutorialView } from "./views/index.js";

export const appRoutes: Routes = {
  '/': () => new HomeView(),
  '/tutorial': () => new TutorialView(),
  '/core-docs/:topic?': () => new CoreDocsView(),
  '/services-docs/:topic?': () => new ServicesDocsView(),
  '/libraries-docs/:topic?': () => new LibrariesDocsView(),
  '/stylin-nutin-docs/:topic?': () => new StylinNutinDocsView(),
  '/testin-nutin-docs/:topic?': () => new TestinNutinDocsView(),
  '/tools-docs/:topic?': () => new ToolsDocsView(),
  '/404': () => new NotFoundView(),
}
