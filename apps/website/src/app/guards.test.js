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
