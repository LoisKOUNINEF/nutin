import { NavbarComponent } from '#root/dist/src/app/components/globals/navbar/navbar.component.js';
import { Navigation } from '#root/dist/src/core/index.js';

function mount() {
  const target = document.createElement('div');
  document.body.appendChild(target);
  const component = new NavbarComponent(target);
  component.render();
  return component;
}

describe('NavbarComponent', () => {
  let navigateSpy;

  beforeAll(() => {
    setupJsdom();
  });

  beforeEach(() => {
    navigateSpy = spyOn(Navigation, 'navigateTo');
    navigateSpy.andCallFake(() => {});
  });

  afterEach(() => {
    navigateSpy.restore();
  });

  it('lists the four documentation sections in the docs dropdown', () => {
    const component = mount();
    const hrefs = [...document.querySelectorAll('#navbar-docs-dropdown [role="menuitem"]')].map((a) => a.getAttribute('href'));
    expect(hrefs).toEqual(['/docs/api', '/docs/options-and-features', '/docs/testing', '/docs/tools']);
    component.destroy();
  });

  it('routes a dropdown item click through the SPA router, even once portaled to <body>', () => {
    const component = mount();
    const dropdown = document.getElementById('navbar-docs-dropdown');
    // What a11y-elements does on connect once its bundle is loaded.
    document.body.appendChild(dropdown);

    dropdown.querySelector('[href="/docs/testing"]').click();
    expect(navigateSpy.callCount).toBe(1);
    expect(navigateSpy.lastCall[0]).toBe('/docs/testing');
    component.destroy();
  });

  it('removes the portaled dropdown when destroyed', () => {
    const component = mount();
    document.body.appendChild(document.getElementById('navbar-docs-dropdown'));
    component.destroy();
    expect(document.getElementById('navbar-docs-dropdown')).toBe(null);
  });

  it('keeps a single dropdown across re-renders', () => {
    const component = mount();
    document.body.appendChild(document.getElementById('navbar-docs-dropdown'));
    component.render();
    expect(document.querySelectorAll('#navbar-docs-dropdown').length).toBe(1);
    component.destroy();
  });
});
