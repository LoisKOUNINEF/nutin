import { GuidesManifest, GuidesManifestService } from '#root/dist/src/app/services/guides-manifest/guides-manifest.service.js';
import { ResourceManifest } from '#root/dist/src/app/services/resource-manifest/resource-manifest.service.js';

describe('GuidesManifest', () => {
  it('exports a GuidesManifest instance', () => {
    expect(GuidesManifestService).toBeInstanceOf(GuidesManifest);
    expect(GuidesManifestService).toBeInstanceOf(ResourceManifest);
  });

  it('load() fetches /generated/guides.json', async () => {
    // A failing response keeps the shared singleton empty for other test files.
    const fetchSpy = spyOn(globalThis, 'fetch').andCallFake(() => Promise.resolve({ ok: false, status: 500 }));
    try {
      await silenceConsole('error', () => GuidesManifestService.load());
    } finally {
      fetchSpy.restore();
    }
    expect(fetchSpy.lastCall[0]).toBe('/generated/guides.json');
  });
});
