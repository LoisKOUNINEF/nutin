import { ResourceContentComponent } from '#root/dist/src/app/components/resource-content/resource-content.component.js';
import { PrismHighlighter } from '#root/dist/src/app/helpers/index.js';
import { Navigation } from '#root/dist/src/core/index.js';

const HEADINGS = [
  { depth: 2, text: 'Install', id: 'install' },
  { depth: 3, text: 'Options', id: 'options' },
];

function page(overrides = {}) {
  return {
    slug: 'use-the-cli',
    title: 'Use the CLI',
    headings: HEADINGS,
    html: '<p>Run it. See <a href="/docs/tools/run-the-builder#usage" data-event="click:_navigateTo:@attr:href">the builder</a>.</p>',
    ...overrides,
  };
}

function mount(config) {
  const target = document.createElement('div');
  document.body.appendChild(target);
  const component = new ResourceContentComponent(target, { routePrefix: 'docs', ...config });
  component.render();
  return component;
}

describe('ResourceContentComponent', () => {
  let applySpy;

  beforeAll(() => {
    setupJsdom();
  });

  beforeEach(() => {
    applySpy = spyOn(PrismHighlighter, 'apply').andCallFake(() => {});
  });

  afterEach(() => {
    applySpy.restore();
    document.body.innerHTML = '';
  });

  it('renders the prefixed empty state without a page, and skips highlighting', () => {
    const component = mount({ page: undefined });
    expect(component.element.querySelector('.resource-content__empty').getAttribute('data-i18n')).toBe('docs.empty');
    expect(applySpy.callCount).toBe(0);
    component.destroy();
  });

  it('renders the page body under the resource-content class and highlights it', () => {
    const component = mount({ page: page() });
    expect(component.element.classList.contains('resource-content')).toBe(true);
    expect(component.element.querySelector('.resource-content__body p').textContent).toContain('Run it.');
    expect(applySpy.callCount).toBe(1);
    component.destroy();
  });

  it('renders a TOC entry per heading with its depth and anchor', () => {
    const component = mount({ page: page() });
    const items = [...component.element.querySelectorAll('.resource-toc__item')];
    expect(items.map((item) => item.querySelector('a').getAttribute('href'))).toEqual(['#install', '#options']);
    expect(items[1].classList.contains('resource-toc__item--depth-3')).toBe(true);
    component.destroy();
  });

  it('omits the TOC for a single heading', () => {
    const component = mount({ page: page({ headings: [HEADINGS[0]] }) });
    expect(component.element.querySelector('.resource-toc')).toBe(null);
    component.destroy();
  });

  it('routes in-page doc links through the SPA router, hash included', () => {
    const navigateSpy = spyOn(Navigation, 'navigateTo').andCallFake(() => {});
    const component = mount({ page: page() });
    try {
      component.element.querySelector('.resource-content__body a').click();
    } finally {
      navigateSpy.restore();
    }
    expect(navigateSpy.lastCall[0]).toBe('/docs/tools/run-the-builder#usage');
    component.destroy();
  });
});
