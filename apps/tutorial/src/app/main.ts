import nutinConfig from '../../nutin.config.js';
import { AppRouter, Service, I18nService, registerPipes } from '../core/index.js';
import { appRoutes } from './routes.js';

class App {
  constructor() {
    registerPipes();
    AppRouter(appRoutes);
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  if (nutinConfig.i18n) {
    await I18nService.initTranslations();
  }
  new App();
});

window.addEventListener('beforeunload', async () => {
  await Service.destroyAll();
});
