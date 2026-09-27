import { DocsManifest, DocsManifestService } from '#root/dist/src/app/services/docs-manifest/docs-manifest.service.js';
import { ResourceManifest } from '#root/dist/src/app/services/resource-manifest/resource-manifest.service.js';

describe('DocsManifest', () => {
  it('exports a DocsManifest instance', () => {
    expect(DocsManifestService).toBeInstanceOf(DocsManifest);
    expect(DocsManifestService).toBeInstanceOf(ResourceManifest);
  });

  it('load() fetches /generated/docs.json', async () => {
    // A failing response keeps the shared singleton empty for other test files.
    const fetchSpy = spyOn(globalThis, 'fetch').andCallFake(() => Promise.resolve({ ok: false, status: 500 }));
    try {
      await silenceConsole('error', () => DocsManifestService.load());
    } finally {
      fetchSpy.restore();
    }
    expect(fetchSpy.lastCall[0]).toBe('/generated/docs.json');
  });
});
