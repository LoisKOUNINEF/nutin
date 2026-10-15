import { routeSuffixOf, segmentsOf } from './route-output.js';

describe('routeSuffixOf', () => {
  it('maps "/" to an empty suffix and keeps static paths as-is', () => {
    expect(routeSuffixOf({ path: '/' })).toBe('');
    expect(routeSuffixOf({ path: '/about' })).toBe('/about');
  });

  it('fills dynamic segments from mockParams', () => {
    expect(routeSuffixOf({ path: '/blog/:slug', mockParams: { slug: 'hello-world' } })).toBe('/blog/hello-world');
  });

  it('drops an unset optional segment', () => {
    expect(routeSuffixOf({ path: '/docs/:page?' })).toBe('/docs');
  });

  it('encodes param values', () => {
    expect(routeSuffixOf({ path: '/tags/:tag', mockParams: { tag: 'a b' } })).toBe('/tags/a%20b');
  });

  it('prefers an explicit outputPath', () => {
    expect(routeSuffixOf({ path: '/demo/:page?', outputPath: '/demo/overlays/', mockParams: { page: 'x' } })).toBe('/demo/overlays');
  });
});

describe('segmentsOf', () => {
  it('splits a suffix into directory segments', () => {
    expect(segmentsOf('/blog/hello-world')).toEqual(['blog', 'hello-world']);
    expect(segmentsOf('')).toEqual([]);
  });
});
