import { DocsNavComponent } from '#root/dist/src/app/components/docs-nav/docs-nav.component.js';
import { Navigation } from '#root/dist/src/core/index.js';

const SECTIONS = [{ id: 'tools', title: 'Tools', pages: ['use-the-cli', 'run-the-builder'] }];

const manifest = {
  getPage: (slug) => SECTIONS[0].pages.includes(slug) ? { slug, title: slug } : undefined,
};

function mount() {
  const target = document.createElement('div');
  document.body.appendChild(target);
  const component = new DocsNavComponent(target, {
    sections: SECTIONS,
    manifest,
    currentSlug: 'use-the-cli',
    pageHref: (slug) => `/docs/tools/${slug}`,
  });
  component.render();
  return component;
}

// What a11y-elements does on connect once its chunks are loaded.
function portalDrawer() {
  const drawer = document.getElementById('markdown-nav-drawer');
  document.body.appendChild(drawer);
  return drawer;
}

function portalFloating() {
  const stack = document.createElement('div');
  stack.className = 'a11y-floating-stack';
  document.body.appendChild(stack);
  const floating = document.getElementById('markdown-nav-floating');
  stack.appendChild(floating);
  return { stack, floating };
}

describe('DocsNavComponent', () => {
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
    const hrefs = (selector) => [...document.querySelectorAll(`${selector} .markdown-nav__link`)].map((a) => a.getAttribute('href'));

    expect(hrefs('.markdown-nav--sidebar')).toEqual(['/docs/tools/use-the-cli', '/docs/tools/run-the-builder']);
    expect(hrefs('#markdown-nav-drawer')).toEqual(['/docs/tools/use-the-cli', '/docs/tools/run-the-builder']);
    component.destroy();
  });

  it('renders the toggle as an <a11y-floating> controlling the drawer, with no handler of its own', () => {
    const component = mount();
    const floating = document.getElementById('markdown-nav-floating');

    expect(floating.localName).toBe('a11y-floating');
    expect(floating.getAttribute('controls')).toBe('markdown-nav-drawer');
    expect(floating.getAttribute('position')).toBe('bottom-left');
    const toggle = floating.querySelector('button.markdown-nav__drawer-toggle');
    expect(toggle.hasAttribute('aria-label')).toBe(true);
    expect(toggle.hasAttribute('data-event')).toBe(false);
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

  it('removes the portaled drawer and floating toggle when destroyed', () => {
    const component = mount();
    portalDrawer();
    const { stack } = portalFloating();
    component.destroy();
    expect(document.getElementById('markdown-nav-drawer')).toBe(null);
    expect(document.getElementById('markdown-nav-floating')).toBe(null);
    stack.remove();
  });

  it('keeps a single drawer and floating toggle across re-renders, removing the old ones before rendering', () => {
    const component = mount();
    const oldDrawer = portalDrawer();
    const { stack, floating: oldFloating } = portalFloating();
    component.render();
    expect(oldDrawer.isConnected).toBe(false);
    expect(oldFloating.isConnected).toBe(false);
    expect(document.querySelectorAll('#markdown-nav-drawer').length).toBe(1);
    expect(document.querySelectorAll('#markdown-nav-floating').length).toBe(1);
    component.destroy();
    stack.remove();
  });

  it('renders grouped sections and skips slugs missing from the manifest', () => {
    const target = document.createElement('div');
    document.body.appendChild(target);
    const component = new DocsNavComponent(target, {
      sections: [{ id: 'api', title: 'API', groups: [{ id: 'core', title: 'Core', pages: ['use-the-cli', 'ghost-page'] }] }],
      manifest,
      currentSlug: 'use-the-cli',
      pageHref: (slug) => `/docs/api/${slug}`,
    });
    component.render();

    const sidebar = component.element.querySelector('.markdown-nav--sidebar');
    expect(sidebar.querySelector('.markdown-nav__group-title').textContent).toBe('Core');
    expect([...sidebar.querySelectorAll('.markdown-nav__link')].map((a) => a.getAttribute('href'))).toEqual(['/docs/api/use-the-cli']);
    expect(sidebar.querySelector('.markdown-nav__link--active').getAttribute('aria-current')).toBe('page');
    component.destroy();
  });

  it('binds data-event on sidebar links only, not inside the drawer', () => {
    const component = mount();
    expect(component.element.querySelectorAll('.markdown-nav--sidebar [data-event]').length).toBe(2);
    expect(document.querySelectorAll('#markdown-nav-drawer [data-event]').length).toBe(0);
    component.destroy();
  });

  it('routes a sidebar link click through the SPA router', () => {
    const component = mount();
    component.element.querySelector('.markdown-nav--sidebar [href="/docs/tools/run-the-builder"]').click();
    expect(navigateSpy.lastCall[0]).toBe('/docs/tools/run-the-builder');
    component.destroy();
  });

  it('keeps the drawer open on a click outside its links', () => {
    const component = mount();
    const drawer = portalDrawer();
    drawer.setAttribute('open', '');
    drawer.click();
    expect(drawer.hasAttribute('open')).toBe(true);
    expect(navigateSpy.callCount).toBe(0);
    component.destroy();
  });
});
