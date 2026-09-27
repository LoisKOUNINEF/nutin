import { TutorialManifest, TutorialManifestService } from '#root/dist/src/app/services/tutorial-manifest/tutorial-manifest.service.js';
import { ResourceManifest } from '#root/dist/src/app/services/resource-manifest/resource-manifest.service.js';

describe('TutorialManifest', () => {
  it('exports a TutorialManifest instance', () => {
    expect(TutorialManifestService).toBeInstanceOf(TutorialManifest);
    expect(TutorialManifestService).toBeInstanceOf(ResourceManifest);
  });

  it('load() fetches /generated/tutorial.json', async () => {
    // A failing response keeps the shared singleton empty for other test files.
    const fetchSpy = spyOn(globalThis, 'fetch').andCallFake(() => Promise.resolve({ ok: false, status: 500 }));
    try {
      await silenceConsole('error', () => TutorialManifestService.load());
    } finally {
      fetchSpy.restore();
    }
    expect(fetchSpy.lastCall[0]).toBe('/generated/tutorial.json');
  });
});
