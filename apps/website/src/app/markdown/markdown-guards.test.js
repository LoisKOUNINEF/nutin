import { MarkdownGuards } from '#root/dist/src/app/markdown/markdown-guards.js';
import { MarkdownManifestsService } from '#root/dist/src/app/markdown/markdown-manifests.service.js';

const PAGES = { a: { slug: 'a', section: 'api' }, b: { slug: 'b', section: 'tools' } };
const SECTIONS = { api: { id: 'api' }, tools: { id: 'tools' } };

function fakeManifest({ hasPages = true } = {}) {
  return {
    hasPages,
    firstSlug: hasPages ? 'a' : undefined,
    getPage: (slug) => (hasPages ? PAGES[slug] : undefined),
    getSection: (id) => (hasPages ? SECTIONS[id] : undefined),
  };
}

describe('MarkdownGuards', () => {
  let loadSpy;
  let manifest;

  beforeEach(() => {
    manifest = fakeManifest();
    loadSpy = spyOn(MarkdownManifestsService, 'load').andCallFake(() => Promise.resolve(manifest));
  });

  afterEach(() => {
    loadSpy.restore();
  });

  it('pageExists loads the manifest, then allows known slugs and the bare route', async () => {
    const guard = MarkdownGuards.pageExists('docs');
    expect(await guard({ slug: 'a' })).toBe(true);
    expect(await guard({})).toBe(true);
    expect(loadSpy.lastCall[0]).toBe('docs');
  });

  it('pageExists sends unknown slugs to /404', async () => {
    expect(await MarkdownGuards.pageExists('docs')({ slug: 'nope' })).toBe('/404');
  });

  it('both guards let an empty or failed manifest through, for the empty or error state', async () => {
    manifest = fakeManifest({ hasPages: false });
    expect(await MarkdownGuards.pageExists('docs')({ slug: 'a' })).toBe(true);
    expect(await MarkdownGuards.sectionPageExists('docs')({ section: 'api', slug: 'a' })).toBe(true);
  });

  it('sectionPageExists allows the bare route, a known section, and a page of that section', async () => {
    const guard = MarkdownGuards.sectionPageExists('docs');
    expect(await guard({})).toBe(true);
    expect(await guard({ section: 'api' })).toBe(true);
    expect(await guard({ section: 'api', slug: 'a' })).toBe(true);
  });

  it('sectionPageExists sends a page of another section, or an unknown section, to /404', async () => {
    const guard = MarkdownGuards.sectionPageExists('docs');
    expect(await guard({ section: 'api', slug: 'b' })).toBe('/404');
    expect(await guard({ section: 'nope', slug: 'a' })).toBe('/404');
    expect(await guard({ section: 'nope' })).toBe('/404');
  });

  it('sectionPageExists redirects a section-less /<id>/<slug> to the page in its section', async () => {
    expect(await MarkdownGuards.sectionPageExists('docs')({ section: 'b' })).toBe('/docs/tools/b');
  });
});
