import { A11yElementsView } from '#root/dist/src/app/views/a11y-elements/a11y-elements.view.js';
import { CONFIG } from '#root/dist/src/core/config.js';

function renderWith(params) {
  const view = new A11yElementsView();
  view.setRouteParams(params);
  view.render();
  return view;
}

function withReplaceStateSpy(callback) {
  const originalReplaceState = window.history.replaceState;
  const calls = [];
  window.history.replaceState = (state, title, url) => { calls.push(url); };
  try {
    callback();
  } finally {
    window.history.replaceState = originalReplaceState;
  }
  return calls;
}

describe('A11yElementsView', () => {
  let originalI18n;
  let warnSpy;

  beforeAll(() => {
    setupJsdom();
    // Canonical URLs are asserted without the /<lang> prefix the site's i18n adds.
    originalI18n = CONFIG.i18n;
    CONFIG.i18n = false;
  });

  afterAll(() => {
    CONFIG.i18n = originalI18n;
  });

  // The index's SnippetComponents warn that PrismJS isn't loaded under jsdom.
  beforeEach(() => {
    warnSpy = spyOn(console, 'warn');
    warnSpy.andCallFake(() => {});
  });

  afterEach(() => {
    warnSpy.restore();
  });

  it('renders the index when no page route param is present', () => {
    const view = renderWith({});
    expect(view.element.querySelector('.a11y-index')).toBeTruthy();
    view.destroy();
  });

  it('renders the elements demo for page "elements"', () => {
    const view = renderWith({ page: 'elements' });
    expect(view.element.querySelector('#a11y-demo-progress')).toBeTruthy();
    expect(view.element.querySelector('.a11y-index')).toBeFalsy();
    view.destroy();
  });

  it('renders the overlays demo for page "overlays"', () => {
    const view = renderWith({ page: 'overlays' });
    expect(document.getElementById('a11y-demo-modal')).toBeTruthy();
    expect(view.element.querySelector('.a11y-index')).toBeFalsy();
    view.destroy();
  });

  it('falls back to the index for an unknown page', () => {
    const view = renderWith({ page: 'bogus' });
    expect(view.element.querySelector('.a11y-index')).toBeTruthy();
    view.destroy();
  });

  it('onEnter canonicalizes an unknown page to /a11y', () => {
    const view = renderWith({ page: 'bogus' });
    const calls = withReplaceStateSpy(() => view.onEnter());
    expect(calls).toEqual(['/a11y-elements']);
    view.destroy();
  });

  it('onEnter leaves known pages and the bare route untouched', () => {
    for (const params of [{}, { page: 'elements' }, { page: 'overlays' }]) {
      const view = renderWith(params);
      const calls = withReplaceStateSpy(() => view.onEnter());
      expect(calls).toEqual([]);
      view.destroy();
    }
  });
});
