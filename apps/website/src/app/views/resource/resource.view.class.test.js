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
    super({ manifest, routePrefix: 'docs', viewName: 'docs' });
  }
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
      expect(replaceArgs).toBe('/docs/getting-started');
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
});
