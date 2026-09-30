import { resolveMarkdownSources } from '#root/dist/src/app/markdown/markdown-sources.js';

describe('resolveMarkdownSources', () => {
  // Same cases as tools/builder/core/markdown/markdown-compiler.test.js: the compiler names
  // each manifest with this id, so both rules must agree.
  it('derives manifest ids like the compiler does', () => {
    const cases = [
      ['content', 'content', false],
      ['docs/My Guides', 'my-guides', false],
      ['docs/guides/', 'guides', false],
      [{ folder: 'x', routePrefix: 'api' }, 'api', false],
      [{ folder: 'docs', sectionInPath: true }, 'docs', true],
    ];
    const sources = resolveMarkdownSources({ sourceFolders: cases.map(([entry]) => entry) });
    expect(sources).toEqual(cases.map(([, id, sectionInPath]) => ({ id, sectionInPath })));
  });

  it('returns no sources when markdownSources is missing', () => {
    expect(resolveMarkdownSources(undefined)).toEqual([]);
    expect(resolveMarkdownSources({})).toEqual([]);
  });
});
