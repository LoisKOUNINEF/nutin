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
});
