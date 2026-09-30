import nutinConfig from '#root/nutin.config.js';
import { MarkdownManifestsService } from '#root/dist/src/app/markdown/markdown-manifests.service.js';
import { resolveMarkdownSources } from '#root/dist/src/app/markdown/markdown-sources.js';

describe('MarkdownManifestsService', () => {
  it('has one manifest per nutin.config.js "markdownSources" folder', () => {
    const expected = resolveMarkdownSources(nutinConfig.markdownSources);
    expect(MarkdownManifestsService.ids).toEqual(expected.map((source) => source.id));
    expect(MarkdownManifestsService.all.map(({ id, sectionInPath }) => ({ id, sectionInPath }))).toEqual(expected);
  });

  it('returns the same manifest instance for an id', () => {
    for (const id of MarkdownManifestsService.ids) {
      expect(MarkdownManifestsService.get(id)).toBe(MarkdownManifestsService.get(id));
    }
  });

  it('throws on an unknown id', () => {
    expect(() => MarkdownManifestsService.get('__unknown__')).toThrow('Unknown Markdown source "__unknown__"');
  });
});
