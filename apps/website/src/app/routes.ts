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
  '/core-docs/:topic?': () => new CoreDocsView(),
  '/libraries-docs/:topic?': () => new LibrariesDocsView(),
  '/stylin-nutin-docs/:topic?': () => new StylinNutinDocsView(),
  '/testin-nutin-docs/:topic?': () => new TestinNutinDocsView(),
  '/tools-docs/:topic?': () => new ToolsDocsView(),
  '/changelog': () => new ChangelogView(),
  '/404': () => new NotFoundView(),
}
