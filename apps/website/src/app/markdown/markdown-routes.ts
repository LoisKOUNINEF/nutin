import { View } from '../../core/index.js';
import { MarkdownView } from './view/markdown.view.js';
import { MarkdownGuards } from './markdown-guards.js';
import { MarkdownManifestsService } from './markdown-manifests.service.js';

export interface IMarkdownRoutesOptions {
  // Builds the view of a folder's routes, e.g. a MarkdownView with your own components or a
  // subclass of it. Called for every folder, with its id: return new MarkdownView({ id }) for
  // the folders you don't customize.
  view?: (id: string) => View;
}

// One route per nutin.config.js "markdownSources" folder: '/<id>/:slug?', or
// '/<id>/:section?/:slug?' with "sectionInPath: true". Spread into appRoutes; a route
// written after the spread with the same path replaces the generated one.
export function markdownRoutes(options: IMarkdownRoutesOptions = {}): Routes {
  const view = options.view ?? ((id: string) => new MarkdownView({ id }));
  return Object.fromEntries(
    MarkdownManifestsService.all.map(({ id, sectionInPath }) => sectionInPath
      ? [`/${id}/:section?/:slug?`, { view: () => view(id), guards: [MarkdownGuards.sectionPageExists(id)] }]
      : [`/${id}/:slug?`, { view: () => view(id), guards: [MarkdownGuards.pageExists(id)] }]
    )
  );
}
