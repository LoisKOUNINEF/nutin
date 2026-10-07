import { ArticlesIndexView } from '#root/dist/src/app/views/articles-index/articles-index.view.js';
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
    const cards = view.element.querySelectorAll('.card-link');
    expect(cards.length).toBe(4);
    expect([...cards].every((card) => card.tagName === 'A11Y-CARD-LINK')).toBe(true);
  });

  it('onEnter loads the a11y-card-link element', () => {
    const view = new ArticlesIndexView();
    view.render();
    expect(() => view.onEnter()).not.toThrow();
  });
});
