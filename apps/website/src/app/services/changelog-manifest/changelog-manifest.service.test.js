import { ChangelogManifest, ChangelogManifestService } from '#root/dist/src/app/services/changelog-manifest/changelog-manifest.service.js';
import { ResourceManifest } from '#root/dist/src/app/services/resource-manifest/resource-manifest.service.js';

describe('ChangelogManifest', () => {
  it('exports a ChangelogManifest instance', () => {
    expect(ChangelogManifestService).toBeInstanceOf(ChangelogManifest);
    expect(ChangelogManifestService).toBeInstanceOf(ResourceManifest);
  });

  it('load() fetches /generated/changelog.json', async () => {
    // A failing response keeps the shared singleton empty for other test files.
    const fetchSpy = spyOn(globalThis, 'fetch').andCallFake(() => Promise.resolve({ ok: false, status: 500 }));
    try {
      await silenceConsole('error', () => ChangelogManifestService.load());
    } finally {
      fetchSpy.restore();
    }
    expect(fetchSpy.lastCall[0]).toBe('/generated/changelog.json');
  });
});
