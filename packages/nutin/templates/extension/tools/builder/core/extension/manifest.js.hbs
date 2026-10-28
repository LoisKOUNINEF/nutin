// The built manifest for each browser, from src/extension/manifest.json, which is Chrome's.

// Firefox reads Manifest V3 too, with a few differences (see toFirefox).
export const BROWSER_TARGETS = {
  chrome: 'chrome116',
  firefox: 'firefox140',
};
const FIREFOX_MIN_VERSION = '140.0';

// `version` always comes from package.json: a release only bumps it there.
export function buildManifest(source, { browser, version, geckoId }) {
  const manifest = { ...source, version };
  return browser === 'firefox' ? toFirefox(manifest, geckoId) : manifest;
}

// Firefox has a sidebar instead of the side panel, and background scripts instead of a service
// worker. The toolbar button toggles the sidebar (see background.ts); the shortcut does it natively.
export function toFirefox(manifest, geckoId) {
  const { side_panel: sidePanel, minimum_chrome_version: _chromeVersion, commands, background, ...rest } = manifest;
  const firefox = { ...rest };

  if (background?.service_worker) {
    firefox.background = { scripts: [background.service_worker], ...(background.type ? { type: background.type } : {}) };
  }
  if (manifest.permissions) {
    firefox.permissions = manifest.permissions.filter((permission) => permission !== 'sidePanel');
  }

  if (sidePanel) {
    firefox.sidebar_action = {
      default_panel: sidePanel.default_path,
      default_title: manifest.action?.default_title ?? manifest.name,
      ...(manifest.action?.default_icon ? { default_icon: manifest.action.default_icon } : {}),
    };
    const { _execute_action: toggle, ...otherCommands } = commands ?? {};
    const firefoxCommands = { ...otherCommands, ...(toggle ? { _execute_sidebar_action: toggle } : {}) };
    if (Object.keys(firefoxCommands).length) firefox.commands = firefoxCommands;
  } else if (commands) {
    firefox.commands = commands;
  }

  firefox.browser_specific_settings = {
    gecko: {
      id: geckoId,
      strict_min_version: FIREFOX_MIN_VERSION,
      // addons.mozilla.org requires it. Declare what you collect, if anything:
      // https://extensionworkshop.com/documentation/develop/firefox-builtin-data-consent/
      data_collection_permissions: { required: ['none'] },
    },
  };
  return firefox;
}
