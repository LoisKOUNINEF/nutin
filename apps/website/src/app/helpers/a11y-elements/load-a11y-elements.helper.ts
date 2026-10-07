// a11y-elements from npm. Each loader is a dynamic import(), so esbuild puts the
// elements it registers in their own chunks (dist/src/chunks/), fetched the first
// time it runs: pages that don't call it never download them. Importing a define
// entry registers its element(s); calling a loader again reuses the loaded module.
// Their stylesheet is global, in src/styles/main.scss.

// Every element, for the /a11y-elements demo pages.
export function loadA11yElements(): Promise<unknown> {
  return import('a11y-elements/all');
}

// Only <a11y-dropdown>, for the global navbar's Documentation and Guides menus. Client-only
// (called from main.ts), so a defined dropdown never meets the pre-rendered navbar.
export function loadA11yDropdown(): Promise<unknown> {
  return import('a11y-elements/overlays/dropdown');
}

// <a11y-drawer> and the <a11y-floating> button that opens it, for the Markdown views'
// mobile nav (DocsNavComponent). Client-only (called from MarkdownPageView.onEnter),
// like loadA11yDropdown().
export function loadA11yDrawer(): Promise<unknown> {
  return import('a11y-elements/overlays/drawer');
}

export function loadA11yFloating(): Promise<unknown> {
  return import('a11y-elements/overlays/floating');
}

// Only <a11y-card-link>, for the home and articles-index link cards. Client-only
// (called from the views' onEnter), like loadA11yDrawer().
export function loadA11yCardLink(): Promise<unknown> {
  return import('a11y-elements/components/card-link');
}
