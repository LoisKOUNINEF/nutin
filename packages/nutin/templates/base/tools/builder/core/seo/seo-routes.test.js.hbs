import { mergeSeoRoutes } from './seo-routes.js';

describe('mergeSeoRoutes', () => {
  it('appends generated routes after the seo.json ones', () => {
    const merged = mergeSeoRoutes([{ path: '/' }], [{ path: '/docs/:slug?', mockParams: { slug: 'intro' } }]);

    expect(merged.map((route) => route.path)).toEqual(['/', '/docs/:slug?']);
  });

  it('keeps the seo.json entry when both produce the same URL', () => {
    const fromConfig = { path: '/docs/:slug?', mockParams: { slug: 'intro' }, title: 'Hand-written' };
    const generated = [
      { path: '/docs/:slug?', mockParams: { slug: 'intro' }, title: 'Generated' },
      { path: '/docs/:slug?', mockParams: { slug: 'next' }, title: 'Next' },
    ];

    const merged = mergeSeoRoutes([fromConfig], generated);

    expect(merged.map((route) => route.title)).toEqual(['Hand-written', 'Next']);
  });
});
