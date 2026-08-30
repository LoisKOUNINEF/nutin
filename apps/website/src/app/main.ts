import { AppRouter, Service, I18nService, registerPipes, registerGlobals } from '../core/index.js';
import { FooterComponent, NavbarComponent, UnderDevelopmentComponent } from './components/index.js';
import { appRoutes } from './routes.js';

class App {
  constructor() {
    registerPipes();
    AppRouter(appRoutes);

    registerGlobals({
      before: [
        { component: NavbarComponent, id: 'navbar' }, 
        { component: UnderDevelopmentComponent, id: 'under-development' },
      ],
      after: [{ component: FooterComponent, id: 'footer' }],
    });
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  await I18nService.initTranslations();
  await I18nService.loadTranslations(I18nService.currentLanguage);
  new App();
});

window.addEventListener('beforeunload', async () => {
  await Service.destroyAll();
});
