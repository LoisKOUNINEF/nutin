import { NotFoundView } from '#root/dist/src/app/views/not-found/not-found.view.js';
import { Navigation, registerPipes } from '#root/dist/src/core/index.js';

describe('NotFoundView', () => {
  beforeAll(() => {
    setupJsdom();
    silenceConsole('warn', () => registerPipes());
  });

  it('sends the user home from its button', () => {
    const view = new NotFoundView();
    view.render();

    const navigateSpy = spyOn(Navigation, 'navigateTo').andCallFake(() => {});
    try {
      view.element.querySelector('button').click();
    } finally {
      navigateSpy.restore();
    }
    expect(navigateSpy.calls).toEqual([['/']]);
  });
});
