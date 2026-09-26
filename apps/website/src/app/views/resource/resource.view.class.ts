import { ComponentConfig, NavigationManager, View, ViewOptions } from '../../../core/index.js';
import { IResourceSection, ResourceManifest } from '../../services/index.js';
import { ResourceContentComponent, ResourceNavComponent } from '../../components/index.js';

export interface IResourceViewOptions extends ViewOptions {
  manifest: ResourceManifest<any>;
  routePrefix: string;
  // Route carries a ':section?' param before ':slug?' (e.g. '/docs/api/navigate'):
  // the nav only lists that section and every URL includes it.
  sectionScoped?: boolean;
}

// Shared by DocsView/ChangelogView/TutorialView/ArticlesView — each is a thin
// subclass pointing this at its own manifest service and route prefix.
export abstract class ResourceView extends View {
  private readonly manifest: ResourceManifest<any>;
  private readonly routePrefix: string;
  private readonly sectionScoped: boolean;

  constructor({ manifest, routePrefix, sectionScoped = false, ...viewOptions }: IResourceViewOptions) {
    super(viewOptions);
    this.manifest = manifest;
    this.routePrefix = routePrefix;
    this.sectionScoped = sectionScoped;
  }

  private get section(): IResourceSection | undefined {
    if (!this.sectionScoped) return undefined;
    return this.manifest.getSection(this.getRouteParam('section') ?? '') ?? this.manifest.sections[0];
  }

  // Guards.resourcePageExists()/sectionPageExists() already guarantee this slug resolves to a real
  // page — or that the resource has no pages yet — before this view is
  // constructed. See routes.ts.
  private get slug(): string {
    const fallback = this.sectionScoped ? this.manifest.firstSlugOf(this.section) : this.manifest.firstSlug;
    return this.getRouteParam('slug') || fallback || '';
  }

  private get navSections(): IResourceSection[] {
    if (!this.sectionScoped) return this.manifest.sections;
    return this.section ? [this.section] : [];
  }

  private pageHref(slug: string): string {
    const section = this.sectionScoped ? this.manifest.getPage(slug)?.section : undefined;
    return section ? `/${this.routePrefix}/${section}/${slug}` : `/${this.routePrefix}/${slug}`;
  }

  // Landing on the bare route (e.g. /docs) renders the manifest's first page
  // via the fallback above, but the URL stays at /docs. Canonicalize it here
  // so reload/back-forward/bookmarks resolve to the page actually shown.
  // Safe to run unconditionally: onEnter() is only invoked by the client
  // router (never during SSR), always after render, with route params set.
  public onEnter(): void {
    if (!this.getRouteParam('slug') && this.slug) {
      NavigationManager.replaceState(this.pageHref(this.slug));
    }
  }

  public registerChildren(): ComponentConfig[] {
    const page = this.manifest.getPage(this.slug);

    return [
      {
        selector: 'resource-nav',
        factory: (el) => new ResourceNavComponent(el, {
          sections: this.navSections,
          manifest: this.manifest,
          currentSlug: this.slug,
          pageHref: (slug) => this.pageHref(slug),
        }),
      },
      {
        selector: 'resource-content',
        factory: (el) => new ResourceContentComponent(el, { page, routePrefix: this.routePrefix }),
      },
    ];
  }
}
