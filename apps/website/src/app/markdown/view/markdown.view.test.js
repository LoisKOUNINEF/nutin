import { NavigationManager } from '#root/dist/src/core/index.js';
import { MarkdownView } from '#root/dist/src/app/markdown/view/markdown.view.js';
import { MarkdownManifest } from '#root/dist/src/app/markdown/markdown-manifest.js';
import { MarkdownManifestsService } from '#root/dist/src/app/markdown/markdown-manifests.service.js';
import { MarkdownNavComponent } from '#root/dist/src/app/markdown/components/markdown-nav/markdown-nav.component.js';
import { MarkdownContentComponent } from '#root/dist/src/app/markdown/components/markdown-content/markdown-content.component.js';

const page = (slug, section, title) => ({
  slug, section, title, description: `About ${title}`, group: null, order: 0, source: `${slug}.md`, headings: [], html: `<h1>${title}</h1>`,
});

const DATA = {
  sections: [
    { id: 'api', title: 'API', description: 'The API.', pages: ['a'] },
    { id: 'tools', title: 'Tools', description: '', pages: ['b'] },
  ],
  pages: { a: page('a', 'api', 'Page A'), b: page('b', 'tools', 'Page B') },
};

// A fresh manifest per test: the service's own manifests are shared singletons.
async function manifestOf(data, sectionInPath = false) {
  const originalFetch = global.fetch;
  global.fetch = () => Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve(data) });
  try {
    const manifest = new MarkdownManifest({ id: 'docs', sectionInPath }, () => null);
    await manifest.load();
    return manifest;
  } finally {
    global.fetch = originalFetch;
  }
}

function viewOf(manifest, params = {}, options = {}) {
  const view = new MarkdownView({ id: MarkdownManifestsService.ids[0], ...options });
  view.manifest = manifest;
  view.setRouteParams(params);
  return view;
}

describe('MarkdownView', () => {
  let replaceSpy;
  let view;

  beforeEach(() => {
    replaceSpy = spyOn(NavigationManager, 'replaceState').andCallFake(() => {});
  });

  afterEach(() => {
    view?.onExit();
    view?.destroy();
    view = null;
    replaceSpy.restore();
  });

  it('renders the page of the route, and uses its title as the document title', async () => {
    view = viewOf(await manifestOf(DATA), { slug: 'b' });
    view.render();
    expect(view.getElement().querySelector('.markdown-content__body h1').textContent).toBe('Page B');
    expect(view.documentTitle()).toBe('Page B');
  });

  it('without a landing, renders the first page on the bare route and points the URL at it', async () => {
    view = viewOf(await manifestOf(DATA));
    view.render();
    view.onEnter();
    expect(view.getElement().querySelector('.markdown-content__body h1').textContent).toBe('Page A');
    expect(replaceSpy.lastCall[0]).toBe('/docs/a');
  });

  it('with a landing, renders it on the bare route and keeps the URL', async () => {
    view = viewOf(await manifestOf({ ...DATA, landing: { title: 'Docs', description: 'Everything.' } }));
    view.render();
    view.onEnter();
    const element = view.getElement();
    expect(element.querySelector('.markdown-landing__title').textContent).toBe('Docs');
    expect(element.querySelector('.markdown-landing__description').textContent).toBe('Everything.');
    expect([...element.querySelectorAll('.markdown-landing__link')].map((a) => a.getAttribute('href'))).toEqual(['/docs/a', '/docs/b']);
    expect(element.querySelector('.markdown-content__body')).toBe(null);
    expect(replaceSpy.callCount).toBe(0);
    expect(view.documentTitle()).toBe('Docs');
  });

  it('with sections in the URL, the folder landing links each section and the nav lists them all', async () => {
    view = viewOf(await manifestOf({ ...DATA, landing: { title: 'Docs', description: '' } }, true));
    view.render();
    const element = view.getElement();
    expect([...element.querySelectorAll('.markdown-landing__link')].map((a) => a.getAttribute('href'))).toEqual(['/docs/api', '/docs/tools']);
    expect([...element.querySelectorAll('.markdown-nav__section-title')].map((s) => s.textContent)).toEqual(['API', 'Tools']);
  });

  it('with sections in the URL, a section landing lists its pages under its own title', async () => {
    view = viewOf(await manifestOf({ ...DATA, landing: { title: 'Docs', description: '' } }, true), { section: 'api' });
    view.render();
    const element = view.getElement();
    expect(element.querySelector('.markdown-landing__title').textContent).toBe('API');
    expect([...element.querySelectorAll('.markdown-landing__link')].map((a) => a.getAttribute('href'))).toEqual(['/docs/api/a']);
    expect(view.documentTitle()).toBe('API');
  });

  it('uses the nav and content components passed as options', async () => {
    class MyNav extends MarkdownNavComponent {
      constructor(el, config) { super(el, config, () => '<nav class="my-nav"></nav>'); }
    }
    class MyContent extends MarkdownContentComponent {}
    view = viewOf(await manifestOf(DATA), { slug: 'a' }, { navComponent: MyNav, contentComponent: MyContent });
    view.render();
    expect(view.getElement().querySelector('.my-nav')).toBeTruthy();
    expect(view.getElement().querySelector('.markdown-nav')).toBe(null);
    expect(view.getElement().querySelector('.markdown-content__body')).toBeTruthy();
  });

  it('calls onContentRendered with the content element and the page', async () => {
    const calls = [];
    view = viewOf(await manifestOf(DATA), { slug: 'a' }, { onContentRendered: (element, shown) => calls.push([element.className, shown.slug]) });
    view.render();
    expect(calls).toEqual([['markdown-content', 'a']]);
  });

  it('renders without a nav when the template has no nav placeholder', async () => {
    view = viewOf(await manifestOf(DATA), { slug: 'a' }, { template: '<div><div data-component="markdown-content"></div></div>' });
    view.render();
    expect(view.getElement().querySelector('.markdown-nav')).toBe(null);
    expect(view.getElement().querySelector('.markdown-content__body')).toBeTruthy();
  });
});
