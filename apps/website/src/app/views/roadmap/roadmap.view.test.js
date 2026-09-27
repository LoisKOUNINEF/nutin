import { RoadmapView } from '#root/dist/src/app/views/index.js';
import { registerPipes } from '#root/dist/src/core/index.js';

describe('RoadmapView', () => {
  beforeAll(() => {
    setupJsdom();
    silenceConsole('warn', () => registerPipes());
  });

  it('renders the roadmap empty state, without a sidenav, while its manifest has no pages', () => {
    const view = new RoadmapView();
    view.render();
    expect(view.element.querySelector('[data-i18n="roadmap.empty"]')).toBeTruthy();
    expect(view.element.querySelector('.resource-nav')).toBe(null);
  });
});
