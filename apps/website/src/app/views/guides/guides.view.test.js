import { GuidesView } from '#root/dist/src/app/views/index.js';
import { registerPipes } from '#root/dist/src/core/index.js';

describe('GuidesView', () => {
  beforeAll(() => {
    setupJsdom();
    silenceConsole('warn', () => registerPipes());
  });

  it('renders the guides empty state while its manifest has no pages', () => {
    const view = new GuidesView();
    view.render();
    expect(view.element.querySelector('[data-i18n="guides.empty"]')).toBeTruthy();
    expect(view.element.querySelector('.resource-nav')).toBeTruthy();
  });
});
