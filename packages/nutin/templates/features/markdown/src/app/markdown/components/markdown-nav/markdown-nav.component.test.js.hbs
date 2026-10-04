import { Navigation, html } from '#root/dist/src/core/index.js';
import { MarkdownNavComponent, renderNavSection } from '#root/dist/src/app/markdown/components/markdown-nav/markdown-nav.component.js';

const PAGES = { a: { slug: 'a', title: 'Page A' }, b: { slug: 'b', title: 'Page B' } };
const manifest = { getPage: (slug) => PAGES[slug] };

function mount(config, templateFn) {
  const target = document.createElement('div');
  document.body.appendChild(target);
  const component = new MarkdownNavComponent(target, {
    sections: [{ id: 'api', title: 'API', groups: [{ id: 'g', title: 'Group', pages: ['a', 'b', 'missing'] }] }],
    manifest,
    currentSlug: 'b',
    pageHref: (slug) => `/docs/api/${slug}`,
    ...config,
  }, templateFn);
  component.render();
  return component;
}

describe('MarkdownNavComponent', () => {
  it('lists sections, group titles and pages, skipping slugs without a page', () => {
    const component = mount();
    const element = component.getElement();
    expect(element.querySelector('.markdown-nav__section-title').textContent).toBe('API');
    expect(element.querySelector('.markdown-nav__group-title').textContent).toBe('Group');
    expect([...element.querySelectorAll('.markdown-nav__link')].map((a) => a.getAttribute('href'))).toEqual(['/docs/api/a', '/docs/api/b']);
    component.destroy();
  });

  it('marks the current page as active, with aria-current', () => {
    const component = mount();
    const active = component.getElement().querySelector('.markdown-nav__link--active');
    expect(active.textContent).toBe('Page B');
    expect(active.getAttribute('aria-current')).toBe('page');
    expect(component.getElement().querySelectorAll('[aria-current]').length).toBe(1);
    component.destroy();
  });

  it('routes a link click through the SPA router', () => {
    const navigateSpy = spyOn(Navigation, 'navigateTo').andCallFake(() => {});
    const component = mount();
    try {
      component.getElement().querySelector('[href="/docs/api/a"]').click();
    } finally {
      navigateSpy.restore();
    }
    expect(navigateSpy.lastCall[0]).toBe('/docs/api/a');
    component.destroy();
  });

  it('accepts its own template, built from the exported render helpers', () => {
    const component = mount({}, (config) => html`<ul class="my-nav">${config.sections.map((section) => renderNavSection(section, config))}</ul>`);
    const element = component.getElement();
    expect(element.querySelector('.my-nav .markdown-nav__section-title').textContent).toBe('API');
    expect(element.querySelector('nav.markdown-nav')).toBe(null);
    component.destroy();
  });
});
