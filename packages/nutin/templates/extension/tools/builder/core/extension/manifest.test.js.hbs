import { buildManifest, toFirefox } from './manifest.js';

const SIDE_PANEL = {
  manifest_version: 3,
  name: 'demo',
  version: '0.0.0',
  minimum_chrome_version: '116',
  action: { default_title: 'Demo', default_icon: { 16: 'assets/icons/icon-16.png' } },
  side_panel: { default_path: 'index.html' },
  background: { service_worker: 'background.js', type: 'module' },
  permissions: ['sidePanel', 'storage'],
  commands: { _execute_action: { description: 'Open demo' } },
};

const POPUP = {
  manifest_version: 3,
  name: 'demo',
  version: '0.0.0',
  action: { default_title: 'Demo', default_popup: 'index.html' },
  background: { service_worker: 'background.js', type: 'module' },
  permissions: ['storage'],
};

describe('buildManifest', () => {
  it('takes the version from package.json and keeps Chrome\'s manifest otherwise', () => {
    const manifest = buildManifest(SIDE_PANEL, { browser: 'chrome', version: '1.2.3', geckoId: 'demo@example.com' });
    expect(manifest).toEqual({ ...SIDE_PANEL, version: '1.2.3' });
  });

  it('derives Firefox\'s manifest for firefox', () => {
    const manifest = buildManifest(SIDE_PANEL, { browser: 'firefox', version: '1.2.3', geckoId: 'demo@example.com' });
    expect(manifest.version).toBe('1.2.3');
    expect(manifest.browser_specific_settings.gecko.id).toBe('demo@example.com');
  });
});

describe('toFirefox', () => {
  it('turns the side panel into a sidebar, and the service worker into a background script', () => {
    const manifest = toFirefox(SIDE_PANEL, 'demo@example.com');
    expect(manifest.sidebar_action).toEqual({
      default_panel: 'index.html',
      default_title: 'Demo',
      default_icon: { 16: 'assets/icons/icon-16.png' },
    });
    expect(manifest.background).toEqual({ scripts: ['background.js'], type: 'module' });
    expect(manifest.side_panel).toBeUndefined();
    expect(manifest.minimum_chrome_version).toBeUndefined();
  });

  it('drops the sidePanel permission and renames the action command', () => {
    const manifest = toFirefox(SIDE_PANEL, 'demo@example.com');
    expect(manifest.permissions).toEqual(['storage']);
    expect(manifest.commands).toEqual({ _execute_sidebar_action: { description: 'Open demo' } });
  });

  it('keeps a popup as it is', () => {
    const manifest = toFirefox(POPUP, 'demo@example.com');
    expect(manifest.action).toEqual(POPUP.action);
    expect(manifest.sidebar_action).toBeUndefined();
    expect(manifest.commands).toBeUndefined();
  });

  it('adds the gecko settings addons.mozilla.org requires', () => {
    const { gecko } = toFirefox(POPUP, 'demo@example.com').browser_specific_settings;
    expect(gecko.id).toBe('demo@example.com');
    expect(gecko.strict_min_version).toBe('140.0');
    expect(gecko.data_collection_permissions).toEqual({ required: ['none'] });
  });
});
