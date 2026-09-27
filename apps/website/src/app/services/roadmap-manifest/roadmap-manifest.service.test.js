import { RoadmapManifest, RoadmapManifestService } from '#root/dist/src/app/services/roadmap-manifest/roadmap-manifest.service.js';
import { ResourceManifest } from '#root/dist/src/app/services/resource-manifest/resource-manifest.service.js';

describe('RoadmapManifest', () => {
  it('exports a RoadmapManifest instance', () => {
    expect(RoadmapManifestService).toBeInstanceOf(RoadmapManifest);
    expect(RoadmapManifestService).toBeInstanceOf(ResourceManifest);
  });

  it('load() fetches /generated/roadmap.json', async () => {
    // A failing response keeps the shared singleton empty for other test files.
    const fetchSpy = spyOn(globalThis, 'fetch').andCallFake(() => Promise.resolve({ ok: false, status: 500 }));
    try {
      await silenceConsole('error', () => RoadmapManifestService.load());
    } finally {
      fetchSpy.restore();
    }
    expect(fetchSpy.lastCall[0]).toBe('/generated/roadmap.json');
  });
});
