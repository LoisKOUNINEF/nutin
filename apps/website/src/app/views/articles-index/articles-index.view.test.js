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
    const cards = view.element.querySelectorAll('.card-link');
    expect(cards.length).toBe(4);
    expect([...cards].every((card) => card.tagName === 'A11Y-FOCUSABLE')).toBe(true);
  });

  it('onEnter loads the a11y-focusable bundle once, however often it runs', () => {
    const view = new ArticlesIndexView();
    view.render();
    view.onEnter();
    view.onEnter();
    expect(document.head.querySelectorAll('script[src="https://cdn.jsdelivr.net/npm/a11y-elements@0.3.0/dist/browser/components/focusable/define.js"]').length).toBe(1);
  });
});
