import { ArticlesManifest, ArticlesManifestService } from '#root/dist/src/app/services/articles-manifest/articles-manifest.service.js';
import { ResourceManifest } from '#root/dist/src/app/services/resource-manifest/resource-manifest.service.js';

describe('ArticlesManifest', () => {
  it('exports a ArticlesManifest instance', () => {
    expect(ArticlesManifestService).toBeInstanceOf(ArticlesManifest);
    expect(ArticlesManifestService).toBeInstanceOf(ResourceManifest);
  });

  it('load() fetches /generated/articles.json', async () => {
    // A failing response keeps the shared singleton empty for other test files.
    const fetchSpy = spyOn(globalThis, 'fetch').andCallFake(() => Promise.resolve({ ok: false, status: 500 }));
    try {
      await silenceConsole('error', () => ArticlesManifestService.load());
    } finally {
      fetchSpy.restore();
    }
    expect(fetchSpy.lastCall[0]).toBe('/generated/articles.json');
  });
});
