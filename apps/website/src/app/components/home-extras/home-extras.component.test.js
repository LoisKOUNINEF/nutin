import { HomeExtrasComponent } from '#root/dist/src/app/components/home-extras/home-extras.component.js';
import { Navigation } from '#root/dist/src/core/index.js';

describe('HomeExtrasComponent', () => {
  beforeAll(() => {
    setupJsdom();
  });

  it('renders the home link cards', () => {
    const target = document.createElement('div');
    document.body.appendChild(target);
    const component = new HomeExtrasComponent(target);
    component.render();
    expect(component.element.querySelectorAll('.card').length).toBeGreaterThan(0);
    component.destroy();
  });

  it('routes each card through the SPA router', () => {
    const navigateSpy = spyOn(Navigation, 'navigateTo').andCallFake(() => {});
    const target = document.createElement('div');
    document.body.appendChild(target);
    const component = new HomeExtrasComponent(target);
    component.render();
    try {
      component.element.querySelector('[data-event="click:navigateTo:tutorial"]').click();
    } finally {
      navigateSpy.restore();
    }
    expect(navigateSpy.lastCall[0]).toBe('/tutorial');
    component.destroy();
  });
});
