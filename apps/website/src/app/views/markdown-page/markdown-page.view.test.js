import { NavigationManager } from '#root/dist/src/core/index.js';
import { MarkdownPageView } from '#root/dist/src/app/views/markdown-page/markdown-page.view.js';
import { MarkdownManifest } from '#root/dist/src/app/markdown/markdown-manifest.js';
import { PrismHighlighter } from '#root/dist/src/app/helpers/prism/prism-highlighter.js';

const DATA = {
  sections: [{ id: 'api', title: 'API', description: '', pages: ['a'] }],
  pages: { a: { slug: 'a', section: 'api', title: 'Page A', description: '', group: null, order: 0, source: 'a.md', headings: [], html: '<h1>Page A</h1><pre><code>x</code></pre>' } },
};

// A fresh manifest per test: the service's own manifests are shared singletons.
async function viewOf(id) {
  const originalFetch = global.fetch;
  global.fetch = () => Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve(DATA) });
  try {
    const manifest = new MarkdownManifest({ id, sectionInPath: false }, () => null);
    await manifest.load();
    const view = new MarkdownPageView(id);
    view.manifest = manifest;
    view.setRouteParams({ slug: 'a' });
    return view;
  } finally {
    global.fetch = originalFetch;
  }
}

describe('MarkdownPageView', () => {
  let view;
  let highlightSpy;

  beforeAll(() => {
    setupJsdom();
  });

  beforeEach(() => {
    highlightSpy = spyOn(PrismHighlighter, 'highlight').andCallFake(() => {});
  });

  afterEach(() => {
    view?.onExit();
    view?.destroy();
    view = null;
    highlightSpy.restore();
  });

  it('renders the docs nav and highlights the page content', async () => {
    view = await viewOf('docs');
    view.render();
    expect(view.getElement().querySelector('.markdown-nav__drawer-toggle')).toBeTruthy();
    expect(highlightSpy.callCount).toBe(1);
    expect(highlightSpy.lastCall[0].classList.contains('markdown-content')).toBe(true);
  });

  it('renders articles without a nav', async () => {
    view = await viewOf('articles');
    view.render();
    expect(view.getElement().querySelector('.markdown-nav__container')).toBe(null);
    expect(view.getElement().querySelector('.markdown-content__body h1').textContent).toBe('Page A');
  });

  it('loads the nav drawer bundle on enter, once', async () => {
    const replaceSpy = spyOn(NavigationManager, 'replaceState').andCallFake(() => {});
    try {
      view = await viewOf('docs');
      view.render();
      view.onEnter();
      view.onEnter();
    } finally {
      replaceSpy.restore();
    }
    expect(document.querySelectorAll('script[src*="overlays/drawer"]').length).toBe(1);
  });
});
