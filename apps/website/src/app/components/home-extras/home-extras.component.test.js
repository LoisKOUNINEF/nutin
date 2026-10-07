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

  it('routes each card link through the SPA router', () => {
    const navigateSpy = spyOn(Navigation, 'navigateTo').andCallFake(() => {});
    const target = document.createElement('div');
    document.body.appendChild(target);
    const component = new HomeExtrasComponent(target);
    component.render();
    const links = [...component.element.querySelectorAll('a11y-card-link .card-title a[href]')];
    try {
      links.forEach((link) => link.click());
    } finally {
      navigateSpy.restore();
    }
    expect(navigateSpy.calls).toEqual([['/tutorial'], ['/docs'], ['/articles/why-nutin']]);
    component.destroy();
  });
});
