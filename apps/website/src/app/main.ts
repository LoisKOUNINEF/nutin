import { AppRouter, Service, I18nService, registerPipes, registerGlobals } from '../core/index.js';
import { FooterComponent, NavbarComponent } from './components/index.js';
import {
  ArticlesManifestService,
  ChangelogManifestService,
  DocsManifestService,
  GuidesManifestService,
  TutorialManifestService,
  RoadmapManifestService
} from './services/index.js';
import { appRoutes } from './routes.js';
import { loadA11yDropdown } from './helpers/index.js';

class App {
  constructor() {
    registerPipes();
    AppRouter(appRoutes);

    registerGlobals({
      before: [{ component: NavbarComponent, id: 'navbar' }],
      after: [{ component: FooterComponent, id: 'footer' }],
    });
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  loadA11yDropdown();
  await I18nService.initTranslations();
  await Promise.all([
    DocsManifestService.load(),
    ChangelogManifestService.load(),
    TutorialManifestService.load(),
    ArticlesManifestService.load(),
    GuidesManifestService.load(),
    RoadmapManifestService.load(),
  ]);
  new App();
});

window.addEventListener('beforeunload', async () => {
  await Service.destroyAll();
});
