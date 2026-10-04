import { buildMarkdownSeoRoutes } from './markdown-seo-routes.js';

const page = (slug, section, extra = {}) => ({ slug, section, title: `T ${slug}`, description: `D ${slug}`, ...extra });

describe('buildMarkdownSeoRoutes', () => {
  it('emits one route per page on /<id>/:slug?, in nav order', () => {
    const manifest = {
      sections: [{ id: 'index', title: 'x', description: '', pages: ['b', 'a'] }],
      pages: { a: page('a', 'index'), b: page('b', 'index') },
    };

    const { routes } = buildMarkdownSeoRoutes([{ id: 'content', seo: true, sectionInPath: false }], { content: manifest });

    expect(routes).toEqual([
      { path: '/content/:slug?', mockParams: { slug: 'b' }, title: 'T b', description: 'D b' },
      { path: '/content/:slug?', mockParams: { slug: 'a' }, title: 'T a', description: 'D a' },
    ]);
  });

  it('fills the section param for sectionInPath sources and walks groups', () => {
    const manifest = {
      sections: [{ id: 'api', title: 'API', description: '', groups: [{ id: 'g', title: 'G', pages: ['nav'] }] }],
      pages: { nav: page('nav', 'api') },
    };

    const { routes } = buildMarkdownSeoRoutes([{ id: 'docs', seo: true, sectionInPath: true }], { docs: manifest });

    expect(routes[0].path).toBe('/docs/:section?/:slug?');
    expect(routes[0].mockParams).toEqual({ section: 'api', slug: 'nav' });
  });

  it('uses the folder ogImage when a page has none of its own', () => {
    const manifest = {
      sections: [{ id: 'index', title: 'x', description: '', pages: ['a', 'b'] }],
      pages: { a: page('a', 'index'), b: page('b', 'index', { ogImage: '/og/b.jpg' }) },
    };
    const { routes } = buildMarkdownSeoRoutes([{ id: 'blog', seo: true, ogImage: '/og/blog.jpg' }], { blog: manifest });
    expect(routes.map((r) => r.ogImage)).toEqual(['/og/blog.jpg', '/og/b.jpg']);
  });

  it('adds landing routes: the bare /<id>, and each section with sectionInPath', () => {
    const manifest = {
      sections: [
        { id: 'api', title: 'API', description: 'The API.', pages: ['nav'] },
        { id: 'tools', title: 'Tools', description: '', pages: ['cli'] },
      ],
      pages: { nav: page('nav', 'api'), cli: page('cli', 'tools') },
      landing: { title: 'Docs', description: 'Everything.' },
    };

    const { routes, warnings } = buildMarkdownSeoRoutes([{ id: 'docs', seo: true, sectionInPath: true, ogImage: '/og/docs.jpg' }], { docs: manifest });
    const landings = routes.filter((r) => !r.mockParams.slug);

    expect(landings).toEqual([
      { path: '/docs/:section?/:slug?', mockParams: {}, title: 'Docs', description: 'Everything.', ogImage: '/og/docs.jpg' },
      { path: '/docs/:section?/:slug?', mockParams: { section: 'api' }, title: 'API', description: 'The API.', ogImage: '/og/docs.jpg' },
      { path: '/docs/:section?/:slug?', mockParams: { section: 'tools' }, title: 'Tools', description: 'Tools', ogImage: '/og/docs.jpg' },
    ]);
    expect(warnings.some((w) => w.includes('"docs/tools" landing'))).toBe(true);
  });

  it('gives a landing per-language titles with i18n, and none without "landing"', () => {
    const en = { sections: [{ id: 'index', title: 'Guides', description: 'How-tos.', pages: ['a'] }], pages: { a: page('a', 'index') }, landing: { title: 'Guides', description: 'How-tos.' } };
    const fr = { ...en, landing: { title: 'Guides FR', description: 'Tutoriels.' } };
    const { routes } = buildMarkdownSeoRoutes([{ id: 'guides', seo: true }], { guides: { en, fr } }, { languages: ['en', 'fr'], defaultLanguage: 'en' });
    const landing = routes.find((r) => !r.mockParams.slug);
    expect(landing.title).toEqual({ en: 'Guides', fr: 'Guides FR' });
    expect(landing.description).toEqual({ en: 'How-tos.', fr: 'Tutoriels.' });

    const { landing: _, ...noLanding } = en;
    expect(buildMarkdownSeoRoutes([{ id: 'guides', seo: true }], { guides: noLanding }).routes.every((r) => r.mockParams.slug)).toBe(true);
  });

  it('skips sources with seo: false', () => {
    const manifest = { sections: [{ id: 'index', pages: ['a'] }], pages: { a: page('a', 'index') } };

    expect(buildMarkdownSeoRoutes([{ id: 'content', seo: false }], { content: manifest }).routes).toEqual([]);
  });

  it('falls back to the section description, then the title, with a warning', () => {
    const manifest = {
      sections: [
        { id: 'one', title: 'One', description: 'Section one', pages: ['a'] },
        { id: 'two', title: 'Two', description: '', pages: ['b'] },
      ],
      pages: { a: page('a', 'one', { description: '' }), b: page('b', 'two', { description: '' }) },
    };

    const { routes, warnings } = buildMarkdownSeoRoutes([{ id: 'c', seo: true }], { c: manifest });

    expect(routes.map((r) => r.description)).toEqual(['Section one', 'T b']);
    expect(warnings.length).toBe(2);
  });

  it('passes a page ogImage through', () => {
    const manifest = { sections: [{ id: 'index', pages: ['a'] }], pages: { a: page('a', 'index', { ogImage: '/og/a.jpg' }) } };

    expect(buildMarkdownSeoRoutes([{ id: 'c', seo: true }], { c: manifest }).routes[0].ogImage).toBe('/og/a.jpg');
  });

  it('with languages, emits per-language titles and descriptions from each manifest', () => {
    const en = { sections: [{ id: 'index', pages: ['a'] }], pages: { a: page('a', 'index', { title: 'Hello', description: 'Hi' }) } };
    const fr = { sections: [{ id: 'index', pages: ['a'] }], pages: { a: page('a', 'index', { title: 'Bonjour', description: 'Salut' }) } };

    const { routes } = buildMarkdownSeoRoutes([{ id: 'c', seo: true }], { c: { en, fr } }, { languages: ['en', 'fr'], defaultLanguage: 'en' });

    expect(routes).toEqual([
      { path: '/c/:slug?', mockParams: { slug: 'a' }, title: { en: 'Hello', fr: 'Bonjour' }, description: { en: 'Hi', fr: 'Salut' } },
    ]);
  });
});

