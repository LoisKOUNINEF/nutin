import { View } from '#root/dist/src/core/index.js';
import { markdownRoutes } from '#root/dist/src/app/markdown/markdown-routes.js';
import { MarkdownView } from '#root/dist/src/app/markdown/view/markdown.view.js';
import { MarkdownManifestsService } from '#root/dist/src/app/markdown/markdown-manifests.service.js';

describe('markdownRoutes', () => {
  it('registers one guarded route per folder, with its section in the path when configured, lazy by default', async () => {
    const routes = markdownRoutes();
    const expected = MarkdownManifestsService.all.map(({ id, sectionInPath }) => (sectionInPath ? `/${id}/:section?/:slug?` : `/${id}/:slug?`));
    expect(Object.keys(routes)).toEqual(expected);
    for (const route of Object.values(routes)) {
      expect(route.guards.length).toBe(1);
      const view = route.view();
      expect(typeof view.then).toBe('function');
      expect(await view).toBeInstanceOf(MarkdownView);
    }
  });

  it('builds each view with the "view" option, given the folder id', () => {
    const ids = [];
    class CustomView extends View {
      constructor() { super({ viewName: 'custom' }); }
    }
    const routes = markdownRoutes({ view: (id) => { ids.push(id); return new CustomView(); } });
    for (const route of Object.values(routes)) expect(route.view()).toBeInstanceOf(CustomView);
    expect(ids).toEqual(MarkdownManifestsService.ids);
  });
});
