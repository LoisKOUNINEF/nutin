import { Guards } from '#root/dist/src/app/guards.js';

const SECTIONS = [
  { id: 'api', pages: ['navigate'] },
  { id: 'tools', pages: ['use-the-cli'] },
];

const manifest = {
  hasPages: true,
  getSection: (id) => SECTIONS.find((section) => section.id === id),
  getPage: (slug) => {
    const section = SECTIONS.find((s) => s.pages.includes(slug));
    return section ? { slug, section: section.id } : undefined;
  },
};

describe('Guards.sectionPageExists', () => {
  const guard = Guards.sectionPageExists(manifest, 'docs');

  it('allows the bare route and a bare known section', () => {
    expect(guard({})).toBe(true);
    expect(guard({ section: 'api' })).toBe(true);
  });

  it('allows a page inside its own section', () => {
    expect(guard({ section: 'api', slug: 'navigate' })).toBe(true);
  });

  it('sends a page requested under the wrong section to /404', () => {
    expect(guard({ section: 'tools', slug: 'navigate' })).toBe('/404');
  });

  it('sends an unknown section or page to /404', () => {
    expect(guard({ section: 'nope' })).toBe('/404');
    expect(guard({ section: 'api', slug: 'nope' })).toBe('/404');
    expect(guard({ section: 'nope', slug: 'navigate' })).toBe('/404');
  });

  it('redirects a legacy /docs/<slug> URL to its section', () => {
    expect(guard({ section: 'use-the-cli' })).toBe('/docs/tools/use-the-cli');
  });

  it('allows everything while the manifest has no pages', () => {
    const emptyGuard = Guards.sectionPageExists({ ...manifest, hasPages: false }, 'docs');
    expect(emptyGuard({ section: 'nope', slug: 'nope' })).toBe(true);
  });
});

const flatManifest = {
  hasPages: true,
  firstSlug: 'getting-started',
  getPage: (slug) => (['getting-started', 'next-steps'].includes(slug) ? { slug } : undefined),
};

describe('Guards.resourcePageExists', () => {
  const guard = Guards.resourcePageExists(flatManifest);

  it('allows a known page and the bare route (first page)', () => {
    expect(guard({ slug: 'next-steps' })).toBe(true);
    expect(guard({})).toBe(true);
  });

  it('sends an unknown page to /404', () => {
    expect(guard({ slug: 'nope' })).toBe('/404');
  });

  it('sends the bare route to /404 when there is no first page to show', () => {
    const noFirst = Guards.resourcePageExists({ ...flatManifest, firstSlug: undefined });
    expect(noFirst({})).toBe('/404');
  });

  it('allows everything while the manifest has no pages', () => {
    const emptyGuard = Guards.resourcePageExists({ ...flatManifest, hasPages: false });
    expect(emptyGuard({ slug: 'nope' })).toBe(true);
  });
});
