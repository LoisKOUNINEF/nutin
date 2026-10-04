import { Navigation } from '#root/dist/src/core/index.js';
import { MarkdownLandingComponent } from '#root/dist/src/app/markdown/components/markdown-landing/markdown-landing.component.js';

const PAGES = {
  a: { slug: 'a', title: 'Page A', description: 'About A' },
  b: { slug: 'b', title: 'Page B', description: '' },
};
const manifest = { getPage: (slug) => PAGES[slug] };
const pageHref = (slug) => `/docs/${slug}`;

function mount(config) {
  const target = document.createElement('div');
  document.body.appendChild(target);
  const component = new MarkdownLandingComponent(target, { title: 'Docs', description: 'Everything.', manifest, pageHref, ...config });
  component.render();
  return component;
}

const texts = (element, selector) => [...element.querySelectorAll(selector)].map((node) => node.textContent.trim());

describe('MarkdownLandingComponent', () => {
  it('lists a single hub\'s groups and pages, without repeating its title', () => {
    const component = mount({ sections: [{ id: 'index', title: 'Docs', description: '', groups: [{ id: 'g', title: 'Basics', pages: ['a', 'b'] }] }] });
    const element = component.getElement();
    expect(element.querySelector('.markdown-landing__title').textContent).toBe('Docs');
    expect(element.querySelector('.markdown-landing__section-title')).toBe(null);
    expect(texts(element, '.markdown-landing__group-title')).toEqual(['Basics']);
    expect(texts(element, '.markdown-landing__link')).toEqual(['Page A', 'Page B']);
    expect(texts(element, '.markdown-landing__page-description')).toEqual(['About A']);
    component.destroy();
  });

  it('heads each section when there are several', () => {
    const component = mount({
      sections: [
        { id: 'api', title: 'API', description: 'The API.', pages: ['a'] },
        { id: 'tools', title: 'Tools', description: '', pages: ['b'] },
      ],
    });
    expect(texts(component.getElement(), '.markdown-landing__section-title')).toEqual(['API', 'Tools']);
    expect(texts(component.getElement(), '.markdown-landing__section-description')).toEqual(['The API.']);
    component.destroy();
  });

  it('links each section to its own landing when sectionHref is set', () => {
    const component = mount({
      sections: [{ id: 'api', title: 'API', description: 'The API.', pages: ['a'] }],
      sectionHref: (id) => `/docs/${id}`,
    });
    const links = [...component.getElement().querySelectorAll('.markdown-landing__link')];
    expect(links.map((a) => a.getAttribute('href'))).toEqual(['/docs/api']);
    expect(component.getElement().querySelector('.markdown-landing__pages')).toBe(null);
    component.destroy();
  });

  it('routes link clicks through the SPA router', () => {
    const navigateSpy = spyOn(Navigation, 'navigateTo').andCallFake(() => {});
    const component = mount({ sections: [{ id: 'index', title: 'Docs', description: '', pages: ['a'] }] });
    try {
      component.getElement().querySelector('.markdown-landing__link').click();
    } finally {
      navigateSpy.restore();
    }
    expect(navigateSpy.lastCall[0]).toBe('/docs/a');
    component.destroy();
  });
});
