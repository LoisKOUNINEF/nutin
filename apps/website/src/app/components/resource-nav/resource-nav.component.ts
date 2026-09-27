import { Component } from '../../../core/index.js';
import { ResourceManifest, IResourceGroup, IResourceSection } from '../../services/index.js';
import { navigateToDoc } from '../../helpers/index.js';

export interface IResourceNavConfig {
  sections: IResourceSection[];
  manifest: ResourceManifest<any>;
  currentSlug: string;
  pageHref: (slug: string) => string;
}

// Links rendered inside the drawer skip data-event: the drawer may portal itself
// to <body> before hydration, so its clicks are delegated instead (onAfterRender).
function renderPageLink(slug: string, config: IResourceNavConfig, inDrawer: boolean): string {
  const page = config.manifest.getPage(slug);
  if (!page) return '';

  const activeClass = slug === config.currentSlug ? ' resource-nav__link--active' : '';
  return `
    <li>
      <a
        href="${config.pageHref(slug)}"
        class="resource-nav__link${activeClass}"
        ${inDrawer ? '' : 'data-event="click:_navigateTo:@attr:href"'}
      >${page.title}</a>
    </li>
  `;
}

function renderGroup(group: IResourceGroup, config: IResourceNavConfig, inDrawer: boolean): string {
  return `
    <li class="resource-nav__group">
      <span class="resource-nav__group-title">${group.title}</span>
      <ul class="resource-nav__pages">${group.pages.map((slug) => renderPageLink(slug, config, inDrawer)).join('')}</ul>
    </li>
  `;
}

function renderSection(section: IResourceSection, config: IResourceNavConfig, inDrawer: boolean): string {
  const items = section.groups
    ? section.groups.map((group) => renderGroup(group, config, inDrawer)).join('')
    : (section.pages ?? []).map((slug) => renderPageLink(slug, config, inDrawer)).join('');

  return `
    <li class="resource-nav__section">
      <span class="resource-nav__section-title">${section.title}</span>
      <ul class="resource-nav__groups">${items}</ul>
    </li>
  `;
}

function renderNav(config: IResourceNavConfig, inDrawer: boolean): string {
  return `
    <nav class="resource-nav${inDrawer ? '' : ' resource-nav--sidebar'}" aria-label="Documentation">
      <ul class="resource-nav__sections">
        ${config.sections.map((section) => renderSection(section, config, inDrawer)).join('')}
      </ul>
    </nav>
  `;
}

const DRAWER_ID = 'resource-nav-drawer';

// Below the `large` breakpoint the sidebar is hidden and the same nav is shown
// in a left <a11y-drawer> instead, opened by the floating toggle button.
const templateFn = (_config: IResourceNavConfig) => `
  ${renderNav(_config, false)}
  <button type="button" class="resource-nav__drawer-toggle" aria-label="Open navigation" data-event="click:openDrawer">
    <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" focusable="false">
      <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" stroke-width="2" stroke-linecap="round" fill="none"/>
    </svg>
  </button>
  <a11y-drawer id="${DRAWER_ID}" edge="left">${renderNav(_config, true)}</a11y-drawer>
`;

export class ResourceNavComponent extends Component<HTMLElement, IResourceNavConfig> {
  private drawer: HTMLElement | null = null;

  constructor(mountTarget: HTMLElement, config: IResourceNavConfig) {
    // Mounting replaces the `resource-nav__container` placeholder outright, so its
    // class must be re-applied here or the sidebar width/spacing CSS never matches.
    super({ templateFn, mountTarget, config, props: { className: 'resource-nav__container' } });
  }

  protected override onAfterRender(): void {
    // The drawer portals itself to <body> once its CDN bundle defines it, so it
    // is looked up in the whole document. A re-render builds a fresh one: drop
    // the previously portaled drawer first so the lookup can't return it.
    this.drawer?.remove();
    this.drawer = document.getElementById(DRAWER_ID);

    if (this.drawer) {
      const onClick = (event: Event) => this.onDrawerClick(event);
      this.drawer.addEventListener('click', onClick);
      this.eventListeners.push([this.drawer, 'click', onClick]);
    }
    super.onAfterRender();
  }

  // Portaled outside this.element, so destroy() wouldn't remove it. Removing it
  // runs its own teardown (releases the focus trap and scroll lock).
  protected override onBeforeDestroy(): void {
    this.drawer?.remove();
    this.drawer = null;
    super.onBeforeDestroy();
  }

  // Opened through the attribute rather than the property: it also works before
  // the element's bundle has upgraded it.
  private openDrawer(): void {
    this.drawer?.setAttribute('open', '');
  }

  private onDrawerClick(event: Event): void {
    const link = (event.target as HTMLElement).closest<HTMLAnchorElement>('a.resource-nav__link');
    if (!link) return;
    event.preventDefault();
    this.drawer?.removeAttribute('open');
    navigateToDoc(link.getAttribute('href') ?? '');
  }

  private _navigateTo(href: string): void {
    navigateToDoc(href);
  }
}
