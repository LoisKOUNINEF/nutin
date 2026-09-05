import { ComponentConfig, View } from '../../../core/index.js';
import { DocsManifestService } from '../../services/index.js';
import { DocContentComponent, DocsNavComponent } from '../../components/index.js';

const template = `__TEMPLATE_PLACEHOLDER__`;

export class DocsView extends View {
  constructor() {
    super({ template, viewName: 'docs' });
  }

  // Guards.docPageExists() already guarantees this slug resolves to a real page
  // before this view is ever constructed — see routes.ts.
  private get slug(): string {
    return this.getRouteParam('slug') || DocsManifestService.firstSlug || '';
  }

  public registerChildren(): ComponentConfig[] {
    const page = DocsManifestService.getPage(this.slug);
    if (!page) return [];

    return [
      {
        selector: 'docs-nav',
        factory: (el) => new DocsNavComponent(el, {
          sections: DocsManifestService.sections,
          currentSlug: this.slug,
        }),
      },
      {
        selector: 'doc-content',
        factory: (el) => new DocContentComponent(el, { page }),
      },
    ];
  }
}
