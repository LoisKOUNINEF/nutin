import { AppRouter, Service, I18nService } from '../core/index.js';
import { registerPipes } from '../libs/index.js';
import { FooterComponent, NavbarComponent } from './components/index.js';
import { appRoutes } from './routes.js';

class App {
  private header: NavbarComponent;
  private footer: FooterComponent;

  constructor() {
    registerPipes();
    AppRouter(appRoutes);

    this.header = new NavbarComponent('body' as unknown as HTMLElement);
    this.footer = new FooterComponent('body' as unknown as HTMLElement);

    this.initialize();
  }

  public async initialize() {
    this.renderBaseLayout();
  }

  private renderBaseLayout() {
    document.body.prepend(this.header.render());
    document.body.append(this.footer.render());
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  await I18nService.initTranslations();
  await I18nService.loadTranslations(I18nService.currentLanguage);
  const app = new App();
});

window.addEventListener('beforeunload', async () => {
  await Service.destroyAll();
});
