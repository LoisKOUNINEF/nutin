// a11y-elements' zero-build option: one self-contained ESM bundle per element
// (dist/browser/**/define.js) plus the shared stylesheet, straight from the CDN.
// Production's CSP only allows this exact version path (tools/docker/nginx.conf
// and its .template): bump them together.
const A11Y_ELEMENTS_DIST = 'https://cdn.jsdelivr.net/npm/a11y-elements@0.2.0/dist';

const ACCESSIBILITY_COMPONENTS = [
  'anchor', 'avatar', 'checkbox', 'focusable', 'input', 'label', 'picture',
  'progress', 'radio-group', 'select', 'skeleton', 'spinner', 'switch',
  'textarea', 'visually-hidden',
];

const OVERLAYS = [
  'blocking-loader', 'context-menu', 'drawer', 'dropdown', 'emergency-dialog',
  'modal', 'notification-banner', 'popover', 'snackbar', 'tooltip',
];

const bundleUrl = (group: string, name: string) => `${A11Y_ELEMENTS_DIST}/browser/${group}/${name}/define.js`;
const STYLESHEET = `${A11Y_ELEMENTS_DIST}/a11y.css`;

// Idempotent: each tag is only appended once, however many loaders request it.
function ensureStylesheet(href: string): void {
  if (document.head.querySelector(`link[href="${href}"]`)) return;
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = href;
  document.head.appendChild(link);
}

function ensureModuleScript(src: string): void {
  if (document.head.querySelector(`script[src="${src}"]`)) return;
  const script = document.createElement('script');
  script.type = 'module';
  script.src = src;
  document.head.appendChild(script);
}

// Every element, for the /a11y-elements demo pages.
export function loadA11yElements(): void {
  ensureStylesheet(STYLESHEET);
  ACCESSIBILITY_COMPONENTS.forEach((name) => ensureModuleScript(bundleUrl('components', name)));
  OVERLAYS.forEach((name) => ensureModuleScript(bundleUrl('overlays', name)));
}

// Only <a11y-dropdown>, for the global navbar's Documentation menu. Client-only
// (called from main.ts), so the pre-rendered HTML stays free of the CDN bundles.
export function loadA11yDropdown(): void {
  ensureStylesheet(STYLESHEET);
  ensureModuleScript(bundleUrl('overlays', 'dropdown'));
}

// Only <a11y-drawer>, for the resource views' mobile sidenav (ResourceNavComponent).
// Client-only (called from ResourceView.onEnter), like loadA11yDropdown().
export function loadA11yDrawer(): void {
  ensureStylesheet(STYLESHEET);
  ensureModuleScript(bundleUrl('overlays', 'drawer'));
}
