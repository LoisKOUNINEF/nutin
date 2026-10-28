import { archiveName, selectBrowsers, buildTimestamp, isPackaged, referencedFiles, checkManifest, checkContents, checkVersions } from './helpers.js';

const CHROME = {
  manifest_version: 3,
  name: 'demo',
  version: '1.2.0',
  icons: { 16: 'assets/icons/icon-16.png' },
  action: { default_icon: { 16: 'assets/icons/icon-16.png' } },
  side_panel: { default_path: 'index.html' },
  background: { service_worker: 'background.js', type: 'module' },
  permissions: ['sidePanel', 'storage'],
};

const FIREFOX = {
  manifest_version: 3,
  name: 'demo',
  version: '1.2.0',
  action: { default_popup: 'index.html' },
  background: { scripts: ['background.js'], type: 'module' },
  permissions: ['storage'],
  browser_specific_settings: { gecko: { id: 'demo@example.com', data_collection_permissions: { required: ['none'] } } },
};

const ENTRIES = ['manifest.json', 'index.html', 'background.js', 'assets/icons/icon-16.png'];

describe('extension helpers', () => {
  it('archiveName() is <name>-<browser>-<version>.zip, without an npm scope', () => {
    expect(archiveName({ name: 'demo', version: '1.2.0' }, 'chrome')).toBe('demo-chrome-1.2.0.zip');
    expect(archiveName({ name: '@me/demo', version: '1.2.0' }, 'firefox')).toBe('demo-firefox-1.2.0.zip');
  });

  it('selectBrowsers() takes --browser, else every configured browser, and rejects others', () => {
    expect(selectBrowsers(['node', 'x.js'], ['chrome', 'firefox'])).toEqual(['chrome', 'firefox']);
    expect(selectBrowsers(['node', 'x.js', '--browser', 'firefox'], ['chrome', 'firefox'])).toEqual(['firefox']);
    expect(() => selectBrowsers(['node', 'x.js', '--browser', 'firefox'], ['chrome'])).toThrow('Unknown browser "firefox"');
  });

  it('buildTimestamp() uses SOURCE_DATE_EPOCH, else 1980-02-01', () => {
    expect(buildTimestamp('1767225600').toISOString()).toBe('2026-01-01T00:00:00.000Z');
    expect(buildTimestamp(undefined).toISOString()).toBe('1980-02-01T00:00:00.000Z');
    expect(buildTimestamp('0').toISOString()).toBe('1980-02-01T00:00:00.000Z');
  });

  it('isPackaged() leaves out maps, compressed copies, copied sources and OS files', () => {
    ['index.html', 'assets/fonts/LICENSE.txt', 'chunks/a-1.js'].forEach((entry) => expect(isPackaged(entry)).toBe(true));
    ['bundle.js.map', 'index.html.gz', 'main.css.br', 'core/index.js', 'app/main.js', 'extension/background.ts', 'config/seo.json', 'assets/.DS_Store']
      .forEach((entry) => expect(isPackaged(entry)).toBe(false));
  });

  it('referencedFiles() lists the files a manifest points to', () => {
    expect(referencedFiles(CHROME)).toEqual(['assets/icons/icon-16.png', 'assets/icons/icon-16.png', 'index.html', 'background.js']);
    expect(referencedFiles({ ...FIREFOX, action: { default_popup: './index.html' } })).toEqual(['index.html', 'background.js']);
  });

  it('checkManifest() accepts a valid manifest for each browser', () => {
    expect(checkManifest(CHROME, ENTRIES, { browser: 'chrome' })).toEqual([]);
    expect(checkManifest(FIREFOX, ENTRIES, { browser: 'firefox', geckoId: 'demo@example.com' })).toEqual([]);
  });

  it('checkManifest() reports missing files and each browser\'s wrong shapes', () => {
    expect(checkManifest(CHROME, ['manifest.json'], { browser: 'chrome' })).toContain('manifest references "index.html", missing from the package');
    expect(checkManifest({ ...CHROME, permissions: ['storage'] }, ENTRIES, { browser: 'chrome' }))
      .toEqual(['Chrome manifest has a side_panel but lacks the "sidePanel" permission']);
    expect(checkManifest(CHROME, ENTRIES, { browser: 'firefox', geckoId: 'demo@example.com' }).length).toBe(4);
    expect(checkManifest(FIREFOX, ENTRIES, { browser: 'firefox', geckoId: 'other@example.com' }))
      .toEqual(['Firefox add-on id is "demo@example.com", expected "other@example.com" (nutin.config.js; it can never change)']);
  });

  it('checkContents() wants manifest.json and index.html at the root, and nothing unpackaged', () => {
    expect(checkContents(ENTRIES)).toEqual([]);
    expect(checkContents(['src/manifest.json', 'bundle.js.map'])).toEqual([
      '"manifest.json" missing from the package\'s root',
      '"index.html" missing from the package\'s root',
      '"bundle.js.map" shouldn\'t be packaged',
    ]);
  });

  it('checkVersions() compares the built manifest and the tag with package.json', () => {
    expect(checkVersions(CHROME, '1.2.0', 'v1.2.0')).toEqual([]);
    expect(checkVersions(CHROME, '1.3.0')).toEqual(['built manifest version 1.2.0 ≠ package.json 1.3.0: rebuild']);
    expect(checkVersions(CHROME, '1.2.0', 'v1.2.1')).toEqual(['tag v1.2.1 ≠ v1.2.0 (package.json)']);
  });
});
