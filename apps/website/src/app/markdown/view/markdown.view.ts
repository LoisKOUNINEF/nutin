import { Component, Navigation, NavigationManager, View, html } from '../../../core/index.js';
import { IMarkdownPage, IMarkdownSection, MarkdownManifest } from '../markdown-manifest.js';
import { MarkdownManifestsService } from '../markdown-manifests.service.js';
import { IMarkdownContentConfig, MarkdownContentComponent } from '../components/markdown-content/markdown-content.component.js';
import { IMarkdownLandingConfig, MarkdownLandingComponent } from '../components/markdown-landing/markdown-landing.component.js';
import { IMarkdownNavConfig, MarkdownNavComponent } from '../components/markdown-nav/markdown-nav.component.js';
import { onMarkdownLanguageChange } from '../markdown-i18n.js';

const defaultTemplate = html`__TEMPLATE_PLACEHOLDER__`;

export type MarkdownComponentClass<C> = new (mountTarget: HTMLElement, config: C) => Component<HTMLElement, C>;

export interface IMarkdownViewOptions {
  // The source's id: its "routePrefix" in nutin.config.js, defaulting to the folder name.
  id: string;
  // A custom layout needs data-component="markdown-nav" and data-component="markdown-content"
  // (the content placeholder also receives the landing). Leave out "markdown-nav" for no nav.
  template?: Template;
  viewName?: string;
  // Replace a part of the page with your own component class, e.g. a subclass with its own
  // template (see the components' optional `templateFn` constructor argument).
  navComponent?: MarkdownComponentClass<IMarkdownNavConfig>;
  contentComponent?: MarkdownComponentClass<IMarkdownContentConfig>;
  landingComponent?: MarkdownComponentClass<IMarkdownLandingConfig>;
  // Called after a page's content is rendered, e.g. to highlight its code blocks.
  onContentRendered?: (element: HTMLElement, page: IMarkdownPage) => void;
}

// Renders one page of a "markdownSources" folder. markdownRoutes() registers one per folder;
// with "sectionInPath: true" the route carries ':section?' before ':slug?' (e.g.
// '/docs/api/navigate'), the nav only lists that section and every URL includes it.
// Subclass it to change more: its getters and helpers are protected.
export class MarkdownView extends View {
  protected readonly manifest: MarkdownManifest;
  protected readonly options: IMarkdownViewOptions;
  private stopLanguageSync: () => void = () => {};

  constructor(options: IMarkdownViewOptions) {
    const { id, template = defaultTemplate, viewName = id } = options;
    super({ template, viewName });
    this.options = options;
    this.manifest = MarkdownManifestsService.get(id);
  }

  protected get section(): IMarkdownSection | undefined {
    if (!this.manifest.sectionInPath) return undefined;
    return this.manifest.getSection(this.getRouteParam('section') ?? '') ?? this.manifest.sections[0];
  }

  // A bare route (no slug) of a folder with "landing": its index is shown instead of a page.
  protected get isLanding(): boolean {
    return !!this.manifest.landing && !this.getRouteParam('slug');
  }

  // MarkdownGuards already loaded the manifest and checked this slug resolves to a real
  // page (or that the folder has no pages yet) before the view is constructed.
  protected get slug(): string {
    if (this.isLanding) return '';
    const fallback = this.manifest.sectionInPath ? this.manifest.firstSlugOf(this.section) : this.manifest.firstSlug;
    return this.getRouteParam('slug') || fallback || '';
  }

  protected get page(): IMarkdownPage | undefined {
    return this.slug ? this.manifest.getPage(this.slug) : undefined;
  }

  protected get navSections(): IMarkdownSection[] {
    if (!this.manifest.sectionInPath) return this.manifest.sections;
    // The folder's own landing lists every section, so its nav does too.
    if (this.isLanding && !this.getRouteParam('section')) return this.manifest.sections;
    return this.section ? [this.section] : [];
  }

  protected pageHref(slug: string): string {
    const section = this.manifest.sectionInPath ? this.manifest.getPage(slug)?.section : undefined;
    return section ? `/${this.manifest.id}/${section}/${slug}` : `/${this.manifest.id}/${slug}`;
  }

  // The landing shown: the folder's (every section), or one section's with "sectionInPath".
  protected landingConfig(): IMarkdownLandingConfig {
    const localized = (path: string) => NavigationManager.addLocalePrefix(path);
    const sectionId = this.getRouteParam('section');
    const section = sectionId ? this.manifest.getSection(sectionId) : undefined;
    const pageHref = (slug: string) => localized(this.pageHref(slug));

    if (section) {
      return { title: section.title, description: section.description, sections: [section], manifest: this.manifest, pageHref };
    }
    const landing = this.manifest.landing ?? { title: this.viewName, description: '' };
    return {
      title: landing.title,
      description: landing.description,
      sections: this.manifest.sections,
      manifest: this.manifest,
      pageHref,
      // With sections in the URL, each one has its own landing: link to it instead of listing its pages.
      ...(this.manifest.sectionInPath ? { sectionHref: (id: string) => localized(`/${this.manifest.id}/${id}`) } : {}),
    };
  }

  // document.title after each navigation: the page's (or landing's) title, as in its SEO page.
  public override documentTitle(): string | undefined {
    if (this.isLanding) return this.landingConfig().title;
    return this.page?.title;
  }

  // The bare route (e.g. /content) renders the first page through the fallback above;
  // point the URL at that page so reloads and bookmarks match what is shown.
  public onEnter(): void {
    if (!this.isLanding && !this.getRouteParam('slug') && this.slug) {
      NavigationManager.replaceState(this.pageHref(this.slug));
    }
    // With i18n, a language change reloads the route: MarkdownGuards load the new
    // language's manifest, and the same page renders in that language.
    this.stopLanguageSync = onMarkdownLanguageChange(() => Navigation.reload());
  }

  public onExit(): void {
    this.stopLanguageSync();
  }

  public registerChildren(): ComponentConfig[] {
    const Nav = this.options.navComponent ?? MarkdownNavComponent;
    const Content = this.options.contentComponent ?? MarkdownContentComponent;
    const Landing = this.options.landingComponent ?? MarkdownLandingComponent;

    return [
      {
        selector: 'markdown-nav',
        factory: (el) => new Nav(el, {
          sections: this.navSections,
          manifest: this.manifest,
          currentSlug: this.slug,
          // The links' hrefs carry the locale prefix with i18n (replaceState adds it itself).
          pageHref: (slug) => NavigationManager.addLocalePrefix(this.pageHref(slug)),
        }),
      },
      {
        selector: 'markdown-content',
        factory: (el) => this.isLanding
          ? new Landing(el, this.landingConfig())
          : new Content(el, { page: this.page, loadFailed: this.manifest.loadFailed, onRendered: this.options.onContentRendered }),
      },
    ];
  }
}
