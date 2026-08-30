import { CatalogHelper } from '#root/dist/src/core/base-classes/base-component/helpers/catalog.helper.js';

describe('CatalogHelper', () => {
  let scope;

  beforeEach(() => {
    scope = document.createElement('div');
    document.body.appendChild(scope);
  });

  afterEach(() => {
    scope.remove();
    scope = null;
  });

  it('returns an empty array when config.items is missing or empty', () => {
    expect(CatalogHelper.generateCatalog({ items: [], selector: 'x', elementName: 'item' }, scope)).toEqual([]);
    expect(CatalogHelper.generateCatalog({ selector: 'x', elementName: 'item' }, scope)).toEqual([]);
  });

  it('returns an empty array when no matching [data-catalog] container exists', () => {
    const configs = CatalogHelper.generateCatalog(
      { items: [{ id: 1 }], selector: 'missing', elementName: 'item' },
      scope
    );
    expect(configs).toEqual([]);
  });

  it('builds a wrapper + inner [data-component] element per array item inside each matching container', () => {
    scope.innerHTML = '<div data-catalog="list"></div>';
    CatalogHelper.generateCatalog(
      { items: [{ id: 1 }, { id: 2 }], selector: 'list', elementName: 'item', component: class {} },
      scope
    );

    const container = scope.querySelector('[data-catalog="list"]');
    expect(container.children.length).toBe(2);
    expect(container.children[0].dataset.index).toBe('0');
    expect(container.children[0].querySelector('[data-component="item-0"]')).toBeDefined();
    expect(container.children[1].dataset.index).toBe('1');
    expect(container.children[1].querySelector('[data-component="item-1"]')).toBeDefined();
  });

  it('clears any pre-existing content in the container before building', () => {
    scope.innerHTML = '<div data-catalog="list"><span class="stale"></span></div>';
    CatalogHelper.generateCatalog(
      { items: [{ id: 1 }], selector: 'list', elementName: 'item', component: class {} },
      scope
    );
    expect(scope.querySelector('.stale')).toBe(null);
  });

  it('uses the configured elementTag for the wrapper element', () => {
    scope.innerHTML = '<div data-catalog="list"></div>';
    CatalogHelper.generateCatalog(
      { items: [{ id: 1 }], selector: 'list', elementName: 'item', elementTag: 'li', component: class {} },
      scope
    );
    const wrapper = scope.querySelector('[data-catalog="list"]').firstElementChild;
    expect(wrapper.tagName).toBe('LI');
  });

  it('returns component configs whose factory constructs the configured component with merged options and an indexed item', () => {
    scope.innerHTML = '<div data-catalog="list"></div>';
    const calls = [];
    class FakeComponent {
      constructor(el, data, props) { calls.push({ el, data, props }); }
    }

    const configs = CatalogHelper.generateCatalog(
      {
        items: [{ id: 1 }],
        selector: 'list',
        elementName: 'item',
        component: FakeComponent,
        props: { a: 1 },
        defaults: { b: 2 },
      },
      scope
    );

    expect(configs.length).toBe(1);
    expect(configs[0].selector).toBe('item-0');

    const el = scope.querySelector('[data-component="item-0"]');
    configs[0].factory(el);

    expect(calls[0].el).toBe(el);
    expect(calls[0].data).toEqual({ id: 1, index: 0 });
    expect(calls[0].props).toEqual({ a: 1, b: 2 });
  });

  it('skips falsy or non-HTMLElement entries returned by querySelectorAll', () => {
    scope.innerHTML = '<div data-catalog="list"></div>';
    const realContainer = scope.querySelector('[data-catalog="list"]');
    const fakeScope = { querySelectorAll: () => [null, realContainer] };

    const configs = CatalogHelper.generateCatalog(
      { items: [{ id: 1 }], selector: 'list', elementName: 'item', component: class {} },
      fakeScope
    );

    expect(configs.length).toBe(1);
  });

  it('wraps primitive array items as { value, index }', () => {
    scope.innerHTML = '<div data-catalog="list"></div>';
    const calls = [];
    class FakeComponent {
      constructor(_el, data) { calls.push(data); }
    }

    const configs = CatalogHelper.generateCatalog(
      { items: ['red', 'blue'], selector: 'list', elementName: 'item', component: FakeComponent },
      scope
    );

    configs[0].factory(scope.querySelector('[data-component="item-0"]'));
    configs[1].factory(scope.querySelector('[data-component="item-1"]'));

    expect(calls[0]).toEqual({ value: 'red', index: 0 });
    expect(calls[1]).toEqual({ value: 'blue', index: 1 });
  });
});
