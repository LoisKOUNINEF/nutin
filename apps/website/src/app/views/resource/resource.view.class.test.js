import { ResourceView } from '#root/dist/src/app/views/resource/resource.view.class.js';

class FakeManifest {
  constructor(firstSlug) {
    this.firstSlug = firstSlug;
    this.sections = [];
  }
  getPage() { return undefined; }
}

class TestResourceView extends ResourceView {
  constructor(manifest) {
    super({ manifest, routePrefix: 'articles', viewName: 'articles' });
  }
}

const SECTIONS = [
  { id: 'api', title: 'API', groups: [{ id: 'components', title: 'Components', pages: ['create-a-component'] }] },
  { id: 'tools', title: 'Tools', pages: ['use-the-cli', 'run-the-builder'] },
];

class FakeSectionedManifest {
  constructor() {
    this.sections = SECTIONS;
    this.firstSlug = 'create-a-component';
  }
  getSection(id) { return SECTIONS.find((section) => section.id === id); }
  firstSlugOf(section) { return (section?.groups?.[0]?.pages ?? section?.pages)?.[0]; }
  getPage(slug) {
    const section = SECTIONS.find((s) => (s.groups?.[0]?.pages ?? s.pages).includes(slug));
    return section ? { slug, title: slug, section: section.id, headings: [], html: '' } : undefined;
  }
}

class TestSectionedView extends ResourceView {
  constructor() {
    super({ manifest: new FakeSectionedManifest(), routePrefix: 'docs', sectionScoped: true, viewName: 'docs' });
  }
}

function captureReplaceState(callback) {
  const originalReplaceState = window.history.replaceState;
  let url = null;
  window.history.replaceState = (state, title, nextUrl) => { url = nextUrl; };
  try {
    callback();
  } finally {
    window.history.replaceState = originalReplaceState;
  }
  return url;
}

describe('ResourceView', () => {
  it('onEnter replaces the URL with the first-page slug when no slug route param is present', () => {
    const view = new TestResourceView(new FakeManifest('getting-started'));
    view.setRouteParams({});

    const originalReplaceState = window.history.replaceState;
    let replaceArgs = null;
    window.history.replaceState = (state, title, url) => { replaceArgs = url; };

    try {
      view.onEnter();
      expect(replaceArgs).toBe('/articles/getting-started');
    } finally {
      window.history.replaceState = originalReplaceState;
    }
  });

  it('onEnter does nothing when an explicit slug route param is already present', () => {
    const view = new TestResourceView(new FakeManifest('getting-started'));
    view.setRouteParams({ slug: 'other-page' });

    const originalReplaceState = window.history.replaceState;
    let called = false;
    window.history.replaceState = () => { called = true; };

    try {
      view.onEnter();
      expect(called).toBe(false);
    } finally {
      window.history.replaceState = originalReplaceState;
    }
  });

  it('onEnter does nothing when the manifest has no pages to fall back to', () => {
    const view = new TestResourceView(new FakeManifest(undefined));
    view.setRouteParams({});

    const originalReplaceState = window.history.replaceState;
    let called = false;
    window.history.replaceState = () => { called = true; };

    try {
      view.onEnter();
      expect(called).toBe(false);
    } finally {
      window.history.replaceState = originalReplaceState;
    }
  });

  it('section-scoped: onEnter canonicalizes a bare section to its first page', () => {
    const view = new TestSectionedView();
    view.setRouteParams({ section: 'tools' });
    expect(captureReplaceState(() => view.onEnter())).toBe('/docs/tools/use-the-cli');
  });

  it('section-scoped: onEnter falls back to the first section on the bare route', () => {
    const view = new TestSectionedView();
    view.setRouteParams({});
    expect(captureReplaceState(() => view.onEnter())).toBe('/docs/api/create-a-component');
  });

  it('section-scoped: the nav only receives the current section, with section-prefixed links', () => {
    const view = new TestSectionedView();
    view.setRouteParams({ section: 'tools', slug: 'run-the-builder' });

    const navConfig = view.registerChildren().find((child) => child.selector === 'resource-nav');
    const nav = navConfig.factory(document.createElement('div'));

    expect(nav.config.sections.map((section) => section.id)).toEqual(['tools']);
    expect(nav.config.currentSlug).toBe('run-the-builder');
    expect(nav.config.pageHref('use-the-cli')).toBe('/docs/tools/use-the-cli');
  });
});
