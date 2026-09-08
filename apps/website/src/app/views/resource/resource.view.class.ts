import { ComponentConfig, View, ViewOptions } from '../../../core/index.js';
import { ResourceManifest } from '../../services/index.js';
import { ResourceContentComponent, ResourceNavComponent } from '../../components/index.js';

export interface IResourceViewOptions extends ViewOptions {
  manifest: ResourceManifest<any>;
  routePrefix: string;
}

// Shared by DocsView/ChangelogView/TutorialView/ArticlesView — each is a thin
// subclass pointing this at its own manifest service and route prefix.
export abstract class ResourceView extends View {
  private readonly manifest: ResourceManifest<any>;
  private readonly routePrefix: string;

  constructor({ manifest, routePrefix, ...viewOptions }: IResourceViewOptions) {
    super(viewOptions);
    this.manifest = manifest;
    this.routePrefix = routePrefix;
  }

  // Guards.resourcePageExists() already guarantees this slug resolves to a real
  // page — or that the resource has no pages yet — before this view is
  // constructed. See routes.ts.
  private get slug(): string {
    return this.getRouteParam('slug') || this.manifest.firstSlug || '';
  }

  public registerChildren(): ComponentConfig[] {
    const page = this.manifest.getPage(this.slug);

    return [
      {
        selector: 'resource-nav',
        factory: (el) => new ResourceNavComponent(el, {
          sections: this.manifest.sections,
          manifest: this.manifest,
          routePrefix: this.routePrefix,
          currentSlug: this.slug,
        }),
      },
      {
        selector: 'resource-content',
        factory: (el) => new ResourceContentComponent(el, { page, routePrefix: this.routePrefix }),
      },
    ];
  }
}
