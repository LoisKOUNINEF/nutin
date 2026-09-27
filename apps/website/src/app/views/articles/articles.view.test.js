import { ArticlesView } from '#root/dist/src/app/views/index.js';
import { registerPipes } from '#root/dist/src/core/index.js';

describe('ArticlesView', () => {
  beforeAll(() => {
    setupJsdom();
    silenceConsole('warn', () => registerPipes());
  });

  it('renders the articles empty state, without a sidenav, while its manifest has no pages', () => {
    const view = new ArticlesView();
    view.render();
    expect(view.element.querySelector('[data-i18n="articles.empty"]')).toBeTruthy();
    expect(view.element.querySelector('.resource-nav')).toBe(null);
  });
});
