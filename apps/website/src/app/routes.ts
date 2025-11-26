import { Routes } from "../core/index.js";
import { 
  ChangelogView,
  CoreDocsView, 
  GetStartedView, 
  HomeView, 
  LibrariesDocsView, 
  NotFoundView, 
  StylinNutinDocsView, 
  TestinNutinDocsView, 
  ToolsDocsView, 
  TutorialView 
} from "./views/index.js";

export const appRoutes: Routes = {
  '/': () => new HomeView(),
  '/get-started': () => new GetStartedView(),
  '/tutorial': () => new TutorialView(),
  '/docs/core-docs/:topic?': () => new CoreDocsView(),
  '/docs/libraries-docs/:topic?': () => new LibrariesDocsView(),
  '/docs/stylin-nutin-docs/:topic?': () => new StylinNutinDocsView(),
  '/docs/testin-nutin-docs/:topic?': () => new TestinNutinDocsView(),
  '/docs/tools-docs/:topic?': () => new ToolsDocsView(),
  '/changelog': () => new ChangelogView(),
  '/404': () => new NotFoundView(),
}
