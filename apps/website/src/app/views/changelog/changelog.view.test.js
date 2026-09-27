import { ChangelogView } from '#root/dist/src/app/views/index.js';
import { registerPipes } from '#root/dist/src/core/index.js';

describe('ChangelogView', () => {
  beforeAll(() => {
    setupJsdom();
    silenceConsole('warn', () => registerPipes());
  });

  it('renders the changelog empty state while its manifest has no pages', () => {
    const view = new ChangelogView();
    view.render();
    expect(view.element.querySelector('[data-i18n="changelog.empty"]')).toBeTruthy();
    expect(view.element.querySelector('.resource-nav')).toBeTruthy();
  });
});
