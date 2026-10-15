import { collectUrls } from './generate-sitemap-xml.js';

const ROUTES = [
  { path: '/' },
  { path: '/admin' },
  { path: '/users/:id', mockParams: { id: '42' } },
  { path: '/drafts', disallow: true },
];

describe('collectUrls', () => {
  it('lists every route at its prerendered URL, minus routes disallowed for every bot', () => {
    expect(collectUrls('https://site.test', ROUTES, ['en'], { i18n: false })).toEqual([
      'https://site.test/',
      'https://site.test/admin/',
      'https://site.test/users/42/',
    ]);
  });

  it('leaves out routes a guard kept from being prerendered', () => {
    const urls = collectUrls('https://site.test', ROUTES, ['en'], { i18n: false, skippedSuffixes: new Set(['/admin']) });

    expect(urls).toEqual(['https://site.test/', 'https://site.test/users/42/']);
  });

  it('skips a guarded route in every language with i18n on', () => {
    const urls = collectUrls('https://site.test', ROUTES.slice(0, 2), ['en', 'fr'], { i18n: true, skippedSuffixes: new Set(['/admin']) });

    expect(urls).toEqual(['https://site.test/en/', 'https://site.test/fr/']);
  });
});
