import { Routes } from "../core/index.js";
import { 
  ChangelogView,
  CoreView, 
  GetStartedView, 
  HomeView, 
  LibrariesView, 
  NotFoundView, 
  StylinNutinView, 
  TestinNutinView, 
  ToolsView, 
  TutorialView 
} from "./views/index.js";

export const appRoutes: Routes = {
  '/': () => new HomeView(),
  '/get-started': () => new GetStartedView(),
  '/tutorial': () => new TutorialView(),
  '/docs/core/:topic?': () => new CoreView(),
  '/docs/libraries/:topic?': () => new LibrariesView(),
  '/docs/stylin-nutin/:topic?': () => new StylinNutinView(),
  '/docs/testin-nutin/:topic?': () => new TestinNutinView(),
  '/docs/tools/:topic?': () => new ToolsView(),
  '/changelog': () => new ChangelogView(),
  '/404': () => new NotFoundView(),
}
