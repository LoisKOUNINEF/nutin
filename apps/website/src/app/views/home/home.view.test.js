import { HomeView } from '#root/dist/src/app/views/index.js';
import { PrismHighlighter } from '#root/dist/src/app/helpers/index.js';
import { Navigation, registerPipes } from '#root/dist/src/core/index.js';

describe('HomeView', () => {
  let view;
  let applySpy;
  let navigateSpy;

  beforeAll(() => {
    setupJsdom();
    silenceConsole('warn', () => registerPipes());
  });

  beforeEach(() => {
    applySpy = spyOn(PrismHighlighter, 'apply').andCallFake(() => {});
    navigateSpy = spyOn(Navigation, 'navigateTo').andCallFake(() => {});
    view = new HomeView();
    view.render();
  });

  afterEach(() => {
    applySpy.restore();
    navigateSpy.restore();
  });

  it('mounts the extras and every command snippet', () => {
    expect(view.element.querySelector('[data-component]')).toBe(null);
    expect(view.element.querySelectorAll('pre code').length).toBe(7);
    expect(view.element.querySelector('code.language-ts').textContent).toContain('registerChildren()');
  });

  it('routes its own links through the SPA router', () => {
    view.element.querySelector('[data-event="click:navigateTo:changelog"]').click();
    expect(navigateSpy.lastCall[0]).toBe('/changelog');
  });

  it('renders the extras as keyboard-activatable cards and onEnter loads their bundle once', () => {
    const cards = view.element.querySelectorAll('.home__cta-row .card');
    expect(cards.length).toBe(3);
    expect([...cards].every((card) => card.tagName === 'A11Y-FOCUSABLE')).toBe(true);

    view.onEnter();
    view.onEnter();
    expect(document.head.querySelectorAll('script[src="https://cdn.jsdelivr.net/npm/a11y-elements@0.3.0/dist/browser/components/focusable/define.js"]').length).toBe(1);
  });
});
