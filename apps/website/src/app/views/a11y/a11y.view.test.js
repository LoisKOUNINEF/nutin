import { A11yView } from '#root/dist/src/app/views/index.js';

const CDN = 'https://cdn.jsdelivr.net/npm/a11y-elements@0.1.0/dist';

function renderWith(params) {
  const view = new A11yView();
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

describe('A11yView', () => {
  let warnSpy;

  beforeAll(() => {
    setupJsdom();
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
    expect(calls).toEqual(['/a11y']);
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

  it('onEnter loads the a11y-elements stylesheet and bundles once, however often it runs', () => {
    const view = renderWith({});
    view.onEnter();
    view.onEnter();

    const stylesheets = document.head.querySelectorAll(`link[href="${CDN}/a11y.css"]`);
    const scripts = document.head.querySelectorAll(`script[type="module"][src^="${CDN}/browser/"]`);
    expect(stylesheets.length).toBe(1);
    expect(scripts.length).toBe(22);
    expect(document.head.querySelector(`script[src="${CDN}/browser/overlays/modal/define.js"]`)).toBeTruthy();
    view.destroy();
  });
});
