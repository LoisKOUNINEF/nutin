import { AppRouter, initI18n, registerPipes, registerGlobals } from '../core/index.js';
import { NavbarComponent } from './components/globals/navbar/navbar.component.js';
import { FooterComponent } from './components/globals/footer/footer.component.js';
import { appRoutes } from './routes.js';
import { loadA11yDropdown } from './helpers/a11y-elements/load-a11y-elements.helper.js';

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

// Markdown manifests (docs, changelog, tutorial, articles, guides) are loaded by their
// route's guard on first visit.
document.addEventListener('DOMContentLoaded', async () => {
  await initI18n();
  new App();
  // Only once the app has replaced the prerendered navbar: a defined <a11y-dropdown> moves
  // itself to <body>, so a prerendered one defined earlier would escape that removal and
  // stay next to the live navbar's (two dropdowns with the same id).
  void loadA11yDropdown();
});
