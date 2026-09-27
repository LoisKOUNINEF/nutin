import { ArticlesIndexView } from '#root/dist/src/app/views/index.js';
import { registerPipes } from '#root/dist/src/core/index.js';

describe('ArticlesIndexView', () => {
  beforeAll(() => {
    setupJsdom();
    silenceConsole('warn', () => registerPipes());
  });

  it('mounts the read-more article cards', () => {
    const view = new ArticlesIndexView();
    view.render();
    expect(view.element.querySelector('[data-component="read-more"]')).toBe(null);
    expect(view.element.querySelectorAll('.card-link').length).toBe(4);
  });
});
