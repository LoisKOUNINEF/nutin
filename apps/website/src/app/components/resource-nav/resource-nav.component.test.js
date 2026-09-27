import { ResourceNavComponent } from '#root/dist/src/app/components/resource-nav/resource-nav.component.js';
import { Navigation } from '#root/dist/src/core/index.js';

const SECTIONS = [{ id: 'tools', title: 'Tools', pages: ['use-the-cli', 'run-the-builder'] }];

const manifest = {
  getPage: (slug) => SECTIONS[0].pages.includes(slug) ? { slug, title: slug } : undefined,
};

function mount() {
  const target = document.createElement('div');
  document.body.appendChild(target);
  const component = new ResourceNavComponent(target, {
    sections: SECTIONS,
    manifest,
    currentSlug: 'use-the-cli',
    pageHref: (slug) => `/docs/tools/${slug}`,
  });
  component.render();
  return component;
}

// What a11y-elements does on connect once its bundle is loaded.
function portalDrawer() {
  const drawer = document.getElementById('resource-nav-drawer');
  document.body.appendChild(drawer);
  return drawer;
}

describe('ResourceNavComponent', () => {
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

  it('renders the sidebar nav and the same links inside the drawer', () => {
    const component = mount();
    const hrefs = (selector) => [...document.querySelectorAll(`${selector} .resource-nav__link`)].map((a) => a.getAttribute('href'));

    expect(hrefs('.resource-nav--sidebar')).toEqual(['/docs/tools/use-the-cli', '/docs/tools/run-the-builder']);
    expect(hrefs('#resource-nav-drawer')).toEqual(['/docs/tools/use-the-cli', '/docs/tools/run-the-builder']);
    component.destroy();
  });

  it('opens the drawer from the toggle button', () => {
    const component = mount();
    const drawer = portalDrawer();

    component.element.querySelector('.resource-nav__drawer-toggle').click();
    expect(drawer.hasAttribute('open')).toBe(true);
    component.destroy();
  });

  it('closes the portaled drawer and routes through the SPA router on a link click', () => {
    const component = mount();
    const drawer = portalDrawer();
    drawer.setAttribute('open', '');

    drawer.querySelector('[href="/docs/tools/run-the-builder"]').click();
    expect(drawer.hasAttribute('open')).toBe(false);
    expect(navigateSpy.callCount).toBe(1);
    expect(navigateSpy.lastCall[0]).toBe('/docs/tools/run-the-builder');
    component.destroy();
  });

  it('removes the portaled drawer when destroyed', () => {
    const component = mount();
    portalDrawer();
    component.destroy();
    expect(document.getElementById('resource-nav-drawer')).toBe(null);
  });

  it('keeps a single drawer across re-renders', () => {
    const component = mount();
    portalDrawer();
    component.render();
    expect(document.querySelectorAll('#resource-nav-drawer').length).toBe(1);
    component.destroy();
  });
});
