import { NavbarComponent } from '#root/dist/src/app/components/globals/navbar/navbar.component.js';
import { Navigation } from '#root/dist/src/core/index.js';
import { CONFIG } from '#root/dist/src/core/config.js';
function mount() {
  const target = document.createElement('div');
  document.body.appendChild(target);
  const component = new NavbarComponent(target);
  component.render();
  return component;
}

describe('NavbarComponent', () => {
  let navigateSpy;
  let originalI18n;

  beforeAll(() => {
    setupJsdom();
  });

  beforeEach(() => {
    navigateSpy = spyOn(Navigation, 'navigateTo');
    navigateSpy.andCallFake(() => {});
    // The site is i18n: links are rendered with the "/en" prefix. Other suites may leave i18n off.
    originalI18n = CONFIG.i18n;
    CONFIG.i18n = true;
  });

  afterEach(() => {
    navigateSpy.restore();
    CONFIG.i18n = originalI18n;
  });

  it('lists the five documentation sections in the docs dropdown', () => {
    const component = mount();
    const hrefs = [...document.querySelectorAll('#navbar-docs-dropdown [role="menuitem"]')].map((a) => a.getAttribute('href'));
    expect(hrefs).toEqual(['/en/docs/cli/', '/en/docs/api/', '/en/docs/options-and-features/', '/en/docs/testing/', '/en/docs/tools/']);
    component.destroy();
  });

  it('routes a dropdown item click through the SPA router, even once portaled to <body>', () => {
    const component = mount();
    const dropdown = document.getElementById('navbar-docs-dropdown');
    // What a11y-elements does on connect once its bundle is loaded.
    document.body.appendChild(dropdown);

    dropdown.querySelector('[href="/en/docs/testing/"]').click();
    expect(navigateSpy.callCount).toBe(1);
    expect(navigateSpy.lastCall[0]).toBe('/en/docs/testing/');
    component.destroy();
  });

  it('removes the portaled dropdowns when destroyed', () => {
    const component = mount();
    document.body.appendChild(document.getElementById('navbar-docs-dropdown'));
    document.body.appendChild(document.getElementById('navbar-guides-dropdown'));
    component.destroy();
    expect(document.getElementById('navbar-docs-dropdown')).toBe(null);
    expect(document.getElementById('navbar-guides-dropdown')).toBe(null);
  });

  it('lists the guides in the guides dropdown', () => {
    const component = mount();
    const hrefs = [...document.querySelectorAll('#navbar-guides-dropdown [role="menuitem"]')].map((a) => a.getAttribute('href'));
    expect(hrefs).toEqual(['/en/guides/a11y-elements/', '/en/guides/alpinejs/', '/en/guides/jest-vitest/']);
    component.destroy();
  });

  it('routes a guides dropdown item click through the SPA router, even once portaled to <body>', () => {
    const component = mount();
    const dropdown = document.getElementById('navbar-guides-dropdown');
    document.body.appendChild(dropdown);

    dropdown.querySelector('[href="/en/guides/a11y-elements/"]').click();
    expect(navigateSpy.callCount).toBe(1);
    expect(navigateSpy.lastCall[0]).toBe('/en/guides/a11y-elements/');
    component.destroy();
  });

  it('keeps a single dropdown across re-renders', () => {
    const component = mount();
    document.body.appendChild(document.getElementById('navbar-docs-dropdown'));
    component.render();
    expect(document.querySelectorAll('#navbar-docs-dropdown').length).toBe(1);
    component.destroy();
  });

  it('routes its own links through the SPA router', () => {
    const component = mount();
    component.element.querySelector('a[href="/en/tutorial/"]').click();
    expect(navigateSpy.lastCall[0]).toBe('/en/tutorial/');
    component.destroy();
  });

  it('ignores dropdown clicks outside an item, and items without an href', () => {
    const component = mount();
    const dropdown = document.getElementById('navbar-docs-dropdown');
    dropdown.click();
    const item = dropdown.querySelector('[role="menuitem"]');
    item.removeAttribute('href');
    item.click();
    expect(navigateSpy.callCount).toBe(0);
    component.destroy();
  });
});
