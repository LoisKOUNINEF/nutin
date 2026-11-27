import * as CatalogHelper from '#root/dist/src/core/base-classes/base-component/helpers/catalog.helper.js';
import { BaseComponent, getCatalogComponents } from '#root/dist/src/core/index.js';

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

  it('warns in dev for items without a numeric length (Set, Map, generator) and renders nothing', () => {
    scope.innerHTML = '<div data-catalog="list"><p class="empty">No items</p></div>';
    const warn = spyOn(console, 'warn').andCallFake(() => {});
    try {
      const inputs = [new Set([{ id: 1 }]), new Map([[1, { id: 1 }]]), (function* () { yield { id: 1 }; })()];
      inputs.forEach(items => {
        expect(CatalogHelper.generateCatalog({ items, selector: 'list', elementName: 'item', component: class {} }, scope)).toEqual([]);
      });

      expect(warn.calls.length).toBe(3);
      expect(warn.calls[0][0]).toContain('createCatalogComponents() expects an array of items, got [object Set]');
      expect(warn.calls[0][0]).toContain('Array.from(set)');
      expect(warn.calls[1][0]).toContain('[object Map]');
      // Like an empty array: the container's template content stays.
      expect(scope.querySelector('.empty')).not.toBe(null);
    } finally {
      warn.restore();
    }
  });

  it('warns in dev for a string, which would render one item per character', () => {
    scope.innerHTML = '<div data-catalog="list"></div>';
    const warn = spyOn(console, 'warn').andCallFake(() => {});
    try {
      CatalogHelper.generateCatalog({ items: 'ab', selector: 'list', elementName: 'item', component: class {} }, scope);
      expect(warn.calls.length).toBe(1);
      expect(warn.calls[0][0]).toContain('[object String]');
    } finally {
      warn.restore();
    }
  });

  it('does not warn for an array, null/undefined or an array-like such as a NodeList', () => {
    scope.innerHTML = '<div data-catalog="list"></div><span></span><span></span>';
    const warn = spyOn(console, 'warn').andCallFake(() => {});
    try {
      CatalogHelper.generateCatalog({ items: [], selector: 'list', elementName: 'item' }, scope);
      CatalogHelper.generateCatalog({ items: null, selector: 'list', elementName: 'item' }, scope);
      CatalogHelper.generateCatalog({ selector: 'list', elementName: 'item' }, scope);
      const configs = CatalogHelper.generateCatalog(
        { items: scope.querySelectorAll('span'), selector: 'list', elementName: 'item', component: class {} },
        scope
      );
      expect(configs.length).toBe(2);
      expect(warn.calls.length).toBe(0);
    } finally {
      warn.restore();
    }
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
        normalizeKeys: ['title'],
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

  it('without keepBy, configs carry no keep value so every item is recreated on re-render', () => {
    scope.innerHTML = '<div data-catalog="list"></div>';
    const configs = CatalogHelper.generateCatalog(
      { items: [{ id: 1 }], selector: 'list', elementName: 'item', component: class {} },
      scope
    );
    expect(configs[0].keep).toBe(undefined);
    expect(configs[0].keepIf).toBe(undefined);
  });

  it('with keepBy, each config carries the keepBy value, a catalog-scoped identity and the raw item to compare', () => {
    scope.innerHTML = '<div data-catalog="list"></div>';
    const items = [{ id: 'a' }, { id: 'b' }];
    class FakeComponent {}
    const configs = CatalogHelper.generateCatalog(
      {
        items,
        selector: 'list',
        elementName: 'item',
        component: FakeComponent,
        props: { a: 1 },
        keepBy: (item, index) => `${item.id}-${index}`,
      },
      scope
    );

    expect(configs[1].selector).toBe('item-1');
    expect(configs[1].keep).toBe('b-1');
    expect(configs[1].scope).toBe('catalog:list:item');
    expect(configs[1].keepIf.item).toBe(items[1]);
    expect(configs[1].keepIf.options).toEqual({ a: 1 });
    expect(configs[1].keepIf.component).toBe(FakeComponent);
  });

  describe('getCatalogComponents', () => {
    class Item extends BaseComponent {
      constructor(el, data) {
        super({ mountTarget: el });
        this.data = data;
      }
      generateTemplate() { return this.data.template ?? `<span>${this.data.name}</span>`; }
    }

    class List extends BaseComponent {
      constructor(mountTarget, { template = '<ul data-catalog="list"></ul>', items = [], keepBy, onBeforeRender } = {}) {
        super({ mountTarget });
        this.template = template;
        this.items = items;
        this.keepBy = keepBy;
        this.beforeRender = onBeforeRender;
      }
      generateTemplate() { return this.template; }
      onBeforeRender() { this.beforeRender?.(this); }
      registerChildren() {
        return this.createCatalogComponents({
          items: this.items, selector: 'list', elementName: 'item', component: Item, keepBy: this.keepBy,
        });
      }
    }

    it('returns the item instances in item order', () => {
      const list = new List(scope, { items: [{ name: 'a' }, { name: 'b' }, { name: 'c' }] });
      list.render();

      const items = getCatalogComponents(list, 'list');

      expect(items.length).toBe(3);
      expect(items.every(item => item instanceof Item)).toBe(true);
      expect(items.map(item => item.data.name)).toEqual(['a', 'b', 'c']);
      list.destroy();
    });

    it('returns the kept instance for an unchanged keepBy item and a new one for a changed item', () => {
      const list = new List(scope, { items: [{ id: 1, name: 'a' }, { id: 2, name: 'b' }], keepBy: (item) => item.id });
      list.render();
      const [first, second] = getCatalogComponents(list, 'list');

      list.items = [{ id: 0, name: 'new' }, { id: 1, name: 'a' }, { id: 2, name: 'changed' }];
      list.render();
      const items = getCatalogComponents(list, 'list');

      expect(items.map(item => item.data.name)).toEqual(['new', 'a', 'changed']);
      expect(items[1]).toBe(first);
      expect(items[2]).not.toBe(second);
      expect(second.isDestroyed).toBe(true);
      list.destroy();
    });

    it('skips containers inside nested components', () => {
      const list = new List(scope, {
        template: '<ul data-catalog="list"></ul>',
        items: [{ name: 'outer' }, { template: '<ul data-catalog="list"></ul>' }],
      });
      list.render();
      // The second item owns a container with the same selector: mount a real item in it, as its own catalog would.
      const nested = getCatalogComponents(list, 'list')[1];
      nested.getElement().querySelector('[data-catalog="list"]').innerHTML = '<li><div></div></li>';
      const inner = new Item(nested.getElement().querySelector('li > div'), { name: 'inner' });

      const items = getCatalogComponents(list, 'list');

      expect(items.length).toBe(2);
      expect(items.includes(inner)).toBe(false);
      list.destroy();
    });

    it('returns the items of several containers one after the other', () => {
      const list = new List(scope, {
        template: '<ul data-catalog="list"></ul><ol data-catalog="list"></ol>',
        items: [{ name: 'a' }, { name: 'b' }],
      });
      list.render();

      const items = getCatalogComponents(list, 'list');

      expect(items.map(item => item.data.name)).toEqual(['a', 'b', 'a', 'b']);
      expect(items[0]).not.toBe(items[2]);
      expect(list.getElement().querySelector('ol').contains(items[2].getElement())).toBe(true);
      list.destroy();
    });

    it('returns [] for an empty catalog, ignoring the template content left in its container', () => {
      const list = new List(scope, { template: '<ul data-catalog="list"><li><p>No items</p></li></ul>' });
      list.render();

      expect(getCatalogComponents(list, 'list')).toEqual([]);
      expect(getCatalogComponents(list, 'missing')).toEqual([]);
      list.destroy();
    });

    it('in onBeforeRender(), returns the previous render\'s items', () => {
      const seen = [];
      const list = new List(scope, {
        items: [{ name: 'a' }],
        onBeforeRender: (self) => seen.push(getCatalogComponents(self, 'list')),
      });
      list.render();
      const [first] = getCatalogComponents(list, 'list');

      list.render();

      expect(seen[0]).toEqual([]);
      expect(seen[1][0]).toBe(first);
      expect(first.isDestroyed).toBe(true);
      list.destroy();
    });

    it('finds items in a <form> container holding a control named children', () => {
      const list = new List(scope, {
        template: '<form data-catalog="list"></form>',
        items: [{ template: '<input name="children">' }, { name: 'b' }],
      });
      list.render();
      // A browser makes form.children the <input name="children">; jsdom needs it by hand.
      const form = list.getElement().querySelector('form');
      Object.defineProperty(form, 'children', { configurable: true, value: form.querySelector('input') });

      expect(getCatalogComponents(list, 'list').length).toBe(2);
      list.destroy();
    });
  });
});
