import { HomeExtrasComponent } from '#root/dist/src/app/components/home-extras/home-extras.component.js';

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
});
