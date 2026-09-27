import { FooterComponent } from '#root/dist/src/app/components/globals/footer/footer.component.js';
import { ThemeTogglerService } from '#root/dist/src/app/services/index.js';
import { Navigation } from '#root/dist/src/core/index.js';

function mount() {
  const target = document.createElement('div');
  document.body.appendChild(target);
  const component = new FooterComponent(target);
  component.render();
  return component;
}

describe('FooterComponent', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  beforeAll(() => {
    setupJsdom();
  });

  it('renders as a <footer>', () => {
    const component = mount();
    expect(component.element.tagName).toBe('FOOTER');
    component.destroy();
  });

  it('routes every internal link through the SPA router', () => {
    const navigateSpy = spyOn(Navigation, 'navigateTo').andCallFake(() => {});
    const component = mount();
    const links = [...component.element.querySelectorAll('a[data-event]')];
    try {
      links.forEach((link) => link.click());
    } finally {
      navigateSpy.restore();
    }
    expect(links.length).toBeGreaterThan(0);
    expect(navigateSpy.calls.map(([href]) => href)).toEqual(links.map((link) => link.getAttribute('href')));
    component.destroy();
  });

  it('toggles the theme from the brand easter egg', () => {
    const toggleSpy = spyOn(ThemeTogglerService, 'toggleTheme').andCallFake(() => {});
    const component = mount();
    try {
      component.element.querySelector('.footer__nutin-brand').click();
    } finally {
      toggleSpy.restore();
    }
    expect(toggleSpy.callCount).toBe(1);
    component.destroy();
  });
});
