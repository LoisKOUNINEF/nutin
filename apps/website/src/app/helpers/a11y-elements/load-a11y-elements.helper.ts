// a11y-elements' zero-build option: one self-contained ESM bundle per element
// (dist/browser/**/define.js) plus the shared stylesheet, straight from the CDN.
// Production's CSP only allows this exact version path (tools/docker/nginx.conf
// and its .template): bump them together.
const A11Y_ELEMENTS_DIST = 'https://cdn.jsdelivr.net/npm/a11y-elements@0.1.0/dist';

const ACCESSIBILITY_COMPONENTS = [
  'anchor', 'avatar', 'checkbox', 'focusable', 'picture', 'progress',
  'radio-group', 'select', 'skeleton', 'spinner', 'switch', 'visually-hidden',
];

const OVERLAYS = [
  'blocking-loader', 'context-menu', 'drawer', 'dropdown', 'emergency-dialog',
  'modal', 'notification-banner', 'popover', 'snackbar', 'tooltip',
];

const bundleUrl = (group: string, name: string) => `${A11Y_ELEMENTS_DIST}/browser/${group}/${name}/define.js`;

// Idempotent: tags are only appended once, however many times /a11y is entered.
export function loadA11yElements(): void {
  const stylesheet = `${A11Y_ELEMENTS_DIST}/a11y.css`;
  if (!document.head.querySelector(`link[href="${stylesheet}"]`)) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = stylesheet;
    document.head.appendChild(link);
  }

  const scripts = [
    ...ACCESSIBILITY_COMPONENTS.map((name) => bundleUrl('accessibility-components', name)),
    ...OVERLAYS.map((name) => bundleUrl('overlays', name)),
  ];

  for (const src of scripts) {
    if (document.head.querySelector(`script[src="${src}"]`)) continue;
    const script = document.createElement('script');
    script.type = 'module';
    script.src = src;
    document.head.appendChild(script);
  }
}
