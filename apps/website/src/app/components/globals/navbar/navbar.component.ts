import { Navigation, Component, I18nService } from '../../../../core/index.js';

// The dropdowns portal themselves to <body> as soon as their CDN bundle defines
// them — possibly before data-i18n/data-event hydration runs. So their item text is
// interpolated here, their clicks are handled by delegation (see onAfterRender),
// and they are looked up by id in the whole document rather than in this.element.
const translate = (key: string) => I18nService.translate(`navbar.${key}`);

const templateFn = () => `__TEMPLATE_PLACEHOLDER__`;

const DROPDOWN_IDS = ['navbar-docs-dropdown', 'navbar-guides-dropdown'];

export class NavbarComponent extends Component<HTMLHeadingElement> {
  private dropdowns: HTMLElement[] = [];

  constructor(mountTarget: HTMLElement) {
    super({templateFn, mountTarget, tagName: 'header'});
  }

  protected override onAfterRender(): void {
    // A re-render builds fresh dropdowns; drop the previously portaled ones first
    // so the id lookups below can't return stale elements.
    this.removeDropdowns();
    this.dropdowns = DROPDOWN_IDS
      .map((id) => document.getElementById(id))
      .filter((dropdown): dropdown is HTMLElement => dropdown !== null);

    const onClick = (event: Event) => this.onDropdownItemClick(event);
    for (const dropdown of this.dropdowns) {
      dropdown.addEventListener('click', onClick);
      this.eventListeners.push([dropdown, 'click', onClick]);
    }
    super.onAfterRender();
  }

  // Portaled outside this.element, so destroy() wouldn't remove them.
  protected override onBeforeDestroy(): void {
    this.removeDropdowns();
    super.onBeforeDestroy();
  }

  private removeDropdowns(): void {
    this.dropdowns.forEach((dropdown) => dropdown.remove());
    this.dropdowns = [];
  }

  // A dropdown closes itself after any item click (mouse or Enter/Space).
  private onDropdownItemClick(event: Event): void {
    const item = (event.target as HTMLElement).closest<HTMLAnchorElement>('a[role="menuitem"]');
    if (!item) return;
    event.preventDefault();
    const href = item.getAttribute('href');
    if (href) Navigation.navigateTo(href);
  }

  private _navigateTo(href: string): void {
    Navigation.navigateTo(href);
  }
}
