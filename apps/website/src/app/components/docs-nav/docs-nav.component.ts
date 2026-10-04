import { I18nService, Navigation, html, raw, SafeHtml } from '../../../core/index.js';
import { IMarkdownGroup, IMarkdownSection } from '../../markdown/markdown-manifest.js';
import { IMarkdownNavConfig, MarkdownNavComponent } from '../../markdown/components/markdown-nav/markdown-nav.component.js';
import { markdownText } from '../../markdown/markdown-i18n.js';

// The docs nav: rendered twice, as a sidebar and inside a left <a11y-drawer> shown below
// the `large` breakpoint. Links inside the drawer skip data-event: the drawer may portal itself
// to <body> before hydration, so its clicks are delegated instead (onAfterRender).
function renderPageLink(slug: string, config: IMarkdownNavConfig, inDrawer: boolean): SafeHtml | string {
  const page = config.manifest.getPage(slug);
  if (!page) return '';

  const current = slug === config.currentSlug;
  const className = `markdown-nav__link${current ? ' markdown-nav__link--active' : ''}`;
  const ariaCurrent = current ? raw('aria-current="page"') : '';

  // Two branches rather than an interpolated data-event: a binding attribute that arrives
  // through ${} in tag position is stripped.
  const link = inDrawer
    ? html`<a href="${config.pageHref(slug)}" class="${className}" ${ariaCurrent}>${page.title}</a>`
    : html`<a href="${config.pageHref(slug)}" class="${className}" ${ariaCurrent} data-event="click:_navigateTo:@attr:href">${page.title}</a>`;

  return html`<li>${link}</li>`;
}

function renderGroup(group: IMarkdownGroup, config: IMarkdownNavConfig, inDrawer: boolean): SafeHtml {
  const title = group.title ? html`<span class="markdown-nav__group-title">${group.title}</span>` : '';
  return html`
    <li class="markdown-nav__group">
      ${title}
      <ul class="markdown-nav__pages">${group.pages.map((slug) => renderPageLink(slug, config, inDrawer))}</ul>
    </li>
  `;
}

function renderSection(section: IMarkdownSection, config: IMarkdownNavConfig, inDrawer: boolean): SafeHtml {
  const items = section.groups
    ? section.groups.map((group) => renderGroup(group, config, inDrawer))
    : (section.pages ?? []).map((slug) => renderPageLink(slug, config, inDrawer));

  return html`
    <li class="markdown-nav__section">
      <span class="markdown-nav__section-title">${section.title}</span>
      <ul class="markdown-nav__groups">${items}</ul>
    </li>
  `;
}

function renderNav(config: IMarkdownNavConfig, inDrawer: boolean): SafeHtml {
  return html`
    <nav class="markdown-nav${inDrawer ? '' : ' markdown-nav--sidebar'}" aria-label="${markdownText('pages', 'Pages')}">
      <ul class="markdown-nav__sections">
        ${config.sections.map((section) => renderSection(section, config, inDrawer))}
      </ul>
    </nav>
  `;
}

const DRAWER_ID = 'markdown-nav-drawer';

const templateFn = (_config: IMarkdownNavConfig) => html`
  ${renderNav(_config, false)}
  <button type="button" class="markdown-nav__drawer-toggle" aria-label="${I18nService.translate('docs-nav.openNavigation', 'Open navigation')}" data-event="click:openDrawer">
    <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" focusable="false">
      <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" stroke-width="2" stroke-linecap="round" fill="none"/>
    </svg>
  </button>
  <a11y-drawer id="${DRAWER_ID}" edge="left">${renderNav(_config, true)}</a11y-drawer>
`;

// Passed to MarkdownView as its navComponent (see views/markdown-page).
export class DocsNavComponent extends MarkdownNavComponent {
  private drawer: HTMLElement | null = null;

  constructor(mountTarget: HTMLElement, config: IMarkdownNavConfig) {
    super(mountTarget, config, templateFn);
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
    const link = (event.target as HTMLElement).closest<HTMLAnchorElement>('a.markdown-nav__link');
    if (!link) return;
    event.preventDefault();
    this.drawer?.removeAttribute('open');
    Navigation.navigateTo(link.getAttribute('href') ?? '');
  }

}
