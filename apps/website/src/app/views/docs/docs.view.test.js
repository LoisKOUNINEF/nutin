import { DocsView } from '#root/dist/src/app/views/index.js';
import { registerPipes } from '#root/dist/src/core/index.js';

describe('DocsView', () => {
  beforeAll(() => {
    setupJsdom();
    silenceConsole('warn', () => registerPipes());
  });

  it('renders the docs empty state while its manifest has no pages', () => {
    const view = new DocsView();
    view.render();
    expect(view.element.querySelector('[data-i18n="docs.empty"]')).toBeTruthy();
    expect(view.element.querySelector('.resource-nav')).toBeTruthy();
  });

  it('is section-scoped: an unknown section yields an empty nav', () => {
    const view = new DocsView();
    view.setRouteParams({ section: 'nope' });
    const navConfig = view.registerChildren().find((child) => child.selector === 'resource-nav');
    const nav = navConfig.factory(document.createElement('div'));
    expect(nav.config.sections).toEqual([]);
  });
});
