import { Navigation, Component, I18nService } from '../../../../core/index.js';

// The docs dropdown portals itself to <body> as soon as its CDN bundle defines
// it — possibly before data-i18n/data-event hydration runs. So its item text is
// interpolated here, its clicks are handled by delegation (see onAfterRender),
// and it is looked up by id in the whole document rather than in this.element.
const t = (key: string) => I18nService.translate(`navbar.${key}`);

const templateFn = () => `__TEMPLATE_PLACEHOLDER__`;

const DOCS_DROPDOWN_ID = 'navbar-docs-dropdown';

export class NavbarComponent extends Component<HTMLHeadingElement> {
  private docsDropdown: HTMLElement | null = null;

  constructor(mountTarget: HTMLElement) {
    super({templateFn, mountTarget, tagName: 'header'});
  }

  protected override onAfterRender(): void {
    // A re-render builds a fresh dropdown; drop the previously portaled one first
    // so the id lookup below can't return the stale element.
    this.docsDropdown?.remove();
    this.docsDropdown = document.getElementById(DOCS_DROPDOWN_ID);

    if (this.docsDropdown) {
      const onClick = (event: Event) => this.onDocsItemClick(event);
      this.docsDropdown.addEventListener('click', onClick);
      this.eventListeners.push([this.docsDropdown, 'click', onClick]);
    }
    super.onAfterRender();
  }

  // Portaled outside this.element, so destroy() wouldn't remove it.
  protected override onBeforeDestroy(): void {
    this.docsDropdown?.remove();
    this.docsDropdown = null;
    super.onBeforeDestroy();
  }

  // The dropdown closes itself after any item click (mouse or Enter/Space).
  private onDocsItemClick(event: Event): void {
    const item = (event.target as HTMLElement).closest<HTMLAnchorElement>('a[role="menuitem"]');
    if (!item) return;
    event.preventDefault();
    Navigation.navigateTo(item.getAttribute('href') ?? '/docs');
  }

  private _navigateTo(href: string): void {
    Navigation.navigateTo(href);
  }
}
