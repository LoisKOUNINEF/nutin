import { ResourceManifest } from '#root/dist/src/app/services/resource-manifest/resource-manifest.service.js';

// Test-only subclass: the real manifest singletons are shared by every test file in the run.
class TestManifest extends ResourceManifest {
  constructor() {
    super('/generated/test.json');
  }
}

const DATA = {
  sections: [
    { id: 'api', title: 'API', description: '', groups: [{ id: 'components', title: 'Components', pages: ['create-a-component'] }] },
    { id: 'tools', title: 'Tools', description: '', pages: ['use-the-cli'] },
  ],
  pages: {
    'create-a-component': { slug: 'create-a-component', section: 'api' },
    'use-the-cli': { slug: 'use-the-cli', section: 'tools' },
  },
};

function response(body, ok = true, status = 200) {
  return Promise.resolve({ ok, status, json: () => Promise.resolve(body) });
}

describe('ResourceManifest', () => {
  let manifest;
  let fetchSpy;

  beforeAll(() => {
    setupJsdom();
  });

  beforeEach(() => {
    manifest = TestManifest.getInstance();
    fetchSpy = spyOn(globalThis, 'fetch');
  });

  afterEach(() => {
    fetchSpy.restore();
    manifest.dispose();
  });

  it('starts empty before load()', () => {
    expect(manifest.sections).toEqual([]);
    expect(manifest.getPage('use-the-cli')).toBeUndefined();
    expect(manifest.firstSlug).toBeUndefined();
    expect(manifest.hasPages).toBe(false);
  });

  it('load() fetches its own manifest URL and exposes sections and pages', async () => {
    fetchSpy.andCallFake(() => response(DATA));
    await manifest.load();

    expect(fetchSpy.lastCall[0]).toBe('/generated/test.json');
    expect(manifest.sections.map((section) => section.id)).toEqual(['api', 'tools']);
    expect(manifest.getPage('use-the-cli').section).toBe('tools');
    expect(manifest.getSection('tools').title).toBe('Tools');
    expect(manifest.getSection('nope')).toBeUndefined();
    expect(manifest.hasPages).toBe(true);
  });

  it('firstSlug prefers the first group of the first section', async () => {
    fetchSpy.andCallFake(() => response(DATA));
    await manifest.load();
    expect(manifest.firstSlug).toBe('create-a-component');
  });

  it('firstSlugOf falls back to flat pages, and to undefined without a section', async () => {
    fetchSpy.andCallFake(() => response(DATA));
    await manifest.load();
    expect(manifest.firstSlugOf(manifest.getSection('tools'))).toBe('use-the-cli');
    expect(manifest.firstSlugOf(undefined)).toBeUndefined();
  });

  it('hasPages is false when every group and section is empty', async () => {
    fetchSpy.andCallFake(() => response({
      sections: [
        { id: 'a', groups: [{ id: 'g', pages: [] }] },
        { id: 'b', pages: [] },
        { id: 'c' },
      ],
      pages: {},
    }));
    await manifest.load();
    expect(manifest.hasPages).toBe(false);
  });

  it('load() logs and keeps the empty manifest on a non-ok response', async () => {
    fetchSpy.andCallFake(() => response(DATA, false, 404));
    const errorSpy = spyOn(console, 'error').andCallFake(() => {});
    try {
      await manifest.load();
    } finally {
      errorSpy.restore();
    }
    expect(errorSpy.callCount).toBe(1);
    expect(errorSpy.lastCall[1].message).toBe('HTTP 404');
    expect(manifest.sections).toEqual([]);
  });

  it('load() logs and keeps the empty manifest when fetch rejects', async () => {
    fetchSpy.andCallFake(() => Promise.reject(new Error('offline')));
    const errorSpy = spyOn(console, 'error').andCallFake(() => {});
    try {
      await manifest.load();
    } finally {
      errorSpy.restore();
    }
    expect(errorSpy.callCount).toBe(1);
    expect(manifest.hasPages).toBe(false);
  });
});
