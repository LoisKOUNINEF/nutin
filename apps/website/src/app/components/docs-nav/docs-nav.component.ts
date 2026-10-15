import { I18nService, Navigation, html, raw, SafeHtml } from '../../../core/index.js';
import { IMarkdownGroup, IMarkdownSection } from '../../markdown/markdown-manifest.js';
import { IMarkdownNavConfig, MarkdownNavComponent } from '../../markdown/components/markdown-nav/markdown-nav.component.js';
import { markdownText } from '../../markdown/markdown-i18n.js';

// The docs nav: rendered twice, as a sidebar and inside a left <a11y-drawer> shown below
// the `large` breakpoint, opened by an <a11y-floating> button. Links inside the drawer skip
// data-event: the drawer may portal itself to <body> before hydration, so its clicks are
// delegated instead (onAfterRender). The floating button needs no handler at all: with
// `controls`, it opens the drawer itself and keeps its aria-expanded in sync.
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
const FLOATING_ID = 'markdown-nav-floating';

// The floating button comes after the drawer, so the drawer it controls already exists when it connects.
const templateFn = (_config: IMarkdownNavConfig) => html`
  ${renderNav(_config, false)}
  <a11y-drawer id="${DRAWER_ID}" edge="left">${renderNav(_config, true)}</a11y-drawer>
  <a11y-floating id="${FLOATING_ID}" position="bottom-left" controls="${DRAWER_ID}">
    <button type="button" class="markdown-nav__drawer-toggle" aria-label="${I18nService.translate('docs-nav.openNavigation', 'Open navigation')}">
      <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" focusable="false">
        <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" stroke-width="2" stroke-linecap="round" fill="none"/>
      </svg>
    </button>
  </a11y-floating>
`;

// Passed to MarkdownView as its navComponent (see views/markdown-page).
export class DocsNavComponent extends MarkdownNavComponent {
  private drawer: HTMLElement | null = null;
  private floating: HTMLElement | null = null;

  constructor(mountTarget: HTMLElement, config: IMarkdownNavConfig) {
    super(mountTarget, config, templateFn);
  }

  // Both overlays portal themselves to <body> once their chunks define them, so a
  // re-render doesn't replace them. Remove the previous ones before the new markup
  // connects: otherwise the new floating button's `controls` lookup (and ours below)
  // could find the stale drawer, which still has the same id.
  protected override onBeforeRender(): void {
    this.removeOverlays();
    super.onBeforeRender();
  }

  protected override onAfterRender(): void {
    this.drawer = document.getElementById(DRAWER_ID);
    this.floating = document.getElementById(FLOATING_ID);

    if (this.drawer) {
      const onClick = (event: Event) => this.onDrawerClick(event);
      this.drawer.addEventListener('click', onClick);
      this.eventListeners.push([this.drawer, 'click', onClick]);
    }
    super.onAfterRender();
  }

  // Portaled outside this.element, so destroy() wouldn't remove them.
  protected override onBeforeDestroy(): void {
    this.removeOverlays();
    super.onBeforeDestroy();
  }

  // Removing each runs its own teardown: the drawer releases its focus trap and scroll
  // lock, the floating button unbinds from the drawer and removes its emptied stack.
  private removeOverlays(): void {
    this.floating?.remove();
    this.drawer?.remove();
    this.floating = null;
    this.drawer = null;
  }

  private onDrawerClick(event: Event): void {
    const link = (event.target as HTMLElement).closest<HTMLAnchorElement>('a.markdown-nav__link');
    if (!link) return;
    event.preventDefault();
    this.drawer?.removeAttribute('open');
    Navigation.navigateTo(link.getAttribute('href') ?? '');
  }
}
