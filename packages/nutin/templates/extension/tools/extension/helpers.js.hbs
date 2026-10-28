import path from 'path';
import { errorExit } from '../utils/index.js';

export const BROWSERS = ['chrome', 'firefox'];

// An expected failure (no build, a check that fails...): reported as a message, without a stack.
export class ExtensionError extends Error {}

export function reportError(err, origin) {
  errorExit(err instanceof ExtensionError ? err.message : err, origin);
}

// The store ZIP: dist/<name>-<browser>-<version>.zip. The name is package.json's, minus a scope.
export function archiveName({ name, version }, browser) {
  return `${name.replace(/^@[^/]+\//, '')}-${browser}-${version}.zip`;
}

// `--browser <name>`, else every browser in nutin.config.js's extension.browsers.
export function selectBrowsers(argv, configured = BROWSERS) {
  const index = argv.indexOf('--browser');
  if (index === -1) return configured;
  const browser = argv[index + 1];
  if (!configured.includes(browser)) {
    throw new ExtensionError(`Unknown browser "${browser}": pass one of ${configured.join(', ')} (nutin.config.js "extension.browsers").`);
  }
  return [browser];
}

// The ZIP entries' time: SOURCE_DATE_EPOCH (CI sets it to the commit's time) or a fixed date, so
// the same sources give the same bytes. ZIP can't store dates before 1980.
export function buildTimestamp(sourceDateEpoch) {
  const epoch = Number(sourceDateEpoch);
  return new Date(Number.isFinite(epoch) && epoch > 315532800 ? epoch * 1000 : Date.UTC(1980, 1, 1));
}

// What a store package never holds: source maps, pre-compressed copies, the copied sources of a
// dev build, OS files.
const NOT_PACKAGED = /(^|\/)(\.DS_Store|Thumbs\.db)$|\.(map|gz|br)$|^(app|core|extension|config)\//;

export function isPackaged(entry) {
  return !NOT_PACKAGED.test(entry);
}

// Every file path the manifest points to, relative to the package's root.
export function referencedFiles(manifest) {
  return [
    ...Object.values(manifest.icons ?? {}),
    ...Object.values(manifest.action?.default_icon ?? {}),
    manifest.action?.default_popup,
    ...Object.values(manifest.sidebar_action?.default_icon ?? {}),
    manifest.sidebar_action?.default_panel,
    manifest.side_panel?.default_path,
    manifest.options_ui?.page,
    manifest.background?.service_worker,
    ...(manifest.background?.scripts ?? []),
  ].filter(Boolean).map((file) => path.posix.normalize(file.replace(/^\.?\//, '')));
}

// The built manifest, for this browser.
export function checkManifest(manifest, entries, { browser, geckoId }) {
  const errors = [];
  if (manifest.manifest_version !== 3) errors.push(`manifest_version is ${manifest.manifest_version}, expected 3`);
  ['name', 'version'].forEach((key) => {
    if (!manifest[key]) errors.push(`manifest has no "${key}"`);
  });

  const files = new Set(entries);
  referencedFiles(manifest).forEach((file) => {
    if (!files.has(file)) errors.push(`manifest references "${file}", missing from the package`);
  });

  const permissions = manifest.permissions ?? [];
  if (browser === 'chrome') {
    if (manifest.background?.scripts) errors.push('Chrome manifest has background.scripts: Chrome needs a background.service_worker');
    if (manifest.side_panel && !permissions.includes('sidePanel')) errors.push('Chrome manifest has a side_panel but lacks the "sidePanel" permission');
    if (manifest.browser_specific_settings) errors.push('Chrome manifest has browser_specific_settings');
  } else {
    const gecko = manifest.browser_specific_settings?.gecko;
    if (manifest.background?.service_worker) errors.push('Firefox manifest has a background.service_worker: Firefox needs background.scripts');
    if (manifest.side_panel || permissions.includes('sidePanel')) errors.push('Firefox manifest still has Chrome\'s side panel');
    if (gecko?.id !== geckoId) errors.push(`Firefox add-on id is "${gecko?.id}", expected "${geckoId}" (nutin.config.js; it can never change)`);
    if (!gecko?.data_collection_permissions) errors.push('Firefox manifest has no gecko.data_collection_permissions (addons.mozilla.org requires it)');
  }
  return errors;
}

// The ZIP's file list: the extension at its root, nothing that shouldn't ship.
export function checkContents(entries) {
  const errors = [];
  ['manifest.json', 'index.html'].forEach((entry) => {
    if (!entries.includes(entry)) errors.push(`"${entry}" missing from the package's root`);
  });
  entries.filter((entry) => !isPackaged(entry)).forEach((entry) => {
    errors.push(`"${entry}" shouldn't be packaged`);
  });
  return errors;
}

// package.json is the source of truth: the built manifest, and the release tag, must agree.
export function checkVersions(manifest, version, tag) {
  const errors = [];
  if (manifest.version !== version) errors.push(`built manifest version ${manifest.version} ≠ package.json ${version}: rebuild`);
  if (tag && tag !== `v${version}`) errors.push(`tag ${tag} ≠ v${version} (package.json)`);
  return errors;
}
