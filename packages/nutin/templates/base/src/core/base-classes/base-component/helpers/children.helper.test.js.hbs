import { ChildrenHelper } from '#root/dist/src/core/base-classes/base-component/helpers/children.helper.js';
import { BaseComponent } from '#root/dist/src/core/index.js';

class Widget extends BaseComponent {
  constructor(options) {
    super(options);
    this.renders = 0;
    this.destroyed = false;
  }
  generateTemplate() { return '<p>widget</p>'; }
  render() {
    this.renders++;
    return super.render();
  }
  destroy() {
    this.destroyed = true;
    this.onDestroy?.();
    super.destroy();
  }
}

describe('ChildrenHelper', () => {
  let element;

  beforeEach(() => {
    element = document.createElement('div');
    document.body.appendChild(element);
  });

  afterEach(() => {
    element.remove();
    element = null;
  });

  it('instantiates, renders and registers a child component for each matching [data-component] element', () => {
    element.innerHTML = '<div data-component="widget"></div>';
    const rendered = [];
    const factoryCalls = [];

    const component = {
      registerChildren: () => [{
        selector: 'widget',
        factory: (el) => {
          factoryCalls.push(el);
          return {
            render: () => rendered.push('rendered'),
            destroy: () => {},
          };
        },
      }],
    };

    const registry = ChildrenHelper.createRegistry();
    ChildrenHelper.addChildren(component, element, registry);

    expect(factoryCalls.length).toBe(1);
    expect(factoryCalls[0]).toBe(element.querySelector('[data-component="widget"]'));
    expect(rendered.length).toBe(1);
    expect(registry.unkeyed.length).toBe(1);
  });

  it('instantiates one child per matched element for a single registerChildren entry', () => {
    element.innerHTML = '<div data-component="widget"></div><div data-component="widget"></div>';
    const component = {
      registerChildren: () => [{
        selector: 'widget',
        factory: () => ({ render: () => {}, destroy: () => {} }),
      }],
    };

    const registry = ChildrenHelper.createRegistry();
    ChildrenHelper.addChildren(component, element, registry);

    expect(registry.unkeyed.length).toBe(2);
  });

  it('keeps the placeholder attributes (except data-component) on the mounted child element', () => {
    class Widget extends BaseComponent {
      generateTemplate() { return '<p>widget</p>'; }
    }
    element.innerHTML = '<div data-component="widget" class="my-class" id="my-widget"></div>';
    const component = {
      registerChildren: () => [{
        selector: 'widget',
        factory: (el) => new Widget({ mountTarget: el }),
      }],
    };

    const registry = ChildrenHelper.createRegistry();
    ChildrenHelper.addChildren(component, element, registry);

    const childEl = registry.unkeyed[0].getElement();
    expect(element.contains(childEl)).toBe(true);
    expect(childEl.classList.contains('my-class')).toBe(true);
    expect(childEl.id).toBe('my-widget');
    expect(childEl.hasAttribute('data-component')).toBe(false);
    expect(childEl.innerHTML).toBe('<p>widget</p>');
  });

  it('does nothing when there are no registerChildren', () => {
    const component = { registerChildren: () => [] };
    const registry = ChildrenHelper.createRegistry();
    ChildrenHelper.addChildren(component, element, registry);
    expect(registry.unkeyed.length).toBe(0);
    expect(registry.keyed.size).toBe(0);
  });

  it('destroys previously-tracked children and resets the array before mounting new ones on a second call', () => {
    let destroyCount = 0;
    element.innerHTML = '<div data-component="widget"></div>';
    const component = {
      registerChildren: () => [{
        selector: 'widget',
        factory: () => ({ render: () => {}, destroy: () => destroyCount++ }),
      }],
    };

    const registry = ChildrenHelper.createRegistry();
    ChildrenHelper.addChildren(component, element, registry);
    expect(registry.unkeyed.length).toBe(1);
    expect(destroyCount).toBe(0);

    element.innerHTML = '<div data-component="widget"></div>';
    ChildrenHelper.addChildren(component, element, registry);

    expect(destroyCount).toBe(1);
    expect(registry.unkeyed.length).toBe(1);
  });

  it('destroyChildren calls destroy on every keyed and unkeyed child and empties the registry', () => {
    let destroyCount = 0;
    const registry = ChildrenHelper.createRegistry();
    registry.unkeyed.push({ destroy: () => destroyCount++ });
    registry.keyed.set('a', { instance: { destroy: () => destroyCount++ } });
    ChildrenHelper.destroyChildren(registry);
    expect(destroyCount).toBe(2);
    expect(registry.unkeyed.length).toBe(0);
    expect(registry.keyed.size).toBe(0);
  });

  it('keyed child with an unchanged key is moved into the new placeholder without calling its factory or rendering it', () => {
    const created = [];
    const component = {
      registerChildren: () => [{
        selector: 'widget',
        key: 'w',
        factory: (el) => { const w = new Widget({ mountTarget: el }); created.push(w); return w; },
      }],
    };
    const registry = ChildrenHelper.createRegistry();

    element.innerHTML = '<div data-component="widget"></div>';
    ChildrenHelper.addChildren(component, element, registry);
    element.innerHTML = '<div data-component="widget"></div>';
    ChildrenHelper.addChildren(component, element, registry);

    expect(created.length).toBe(1);
    expect(created[0].renders).toBe(1);
    expect(created[0].destroyed).toBe(false);
    expect(element.contains(created[0].getElement())).toBe(true);
    expect(element.querySelector('[data-component="widget"]')).toBe(null);
    expect(registry.reused).toEqual([created[0]]);
  });

  it('keyed child whose key changed is destroyed and recreated', () => {
    let key = 1;
    const created = [];
    const component = {
      registerChildren: () => [{
        selector: 'widget',
        key,
        factory: (el) => { const w = new Widget({ mountTarget: el }); created.push(w); return w; },
      }],
    };
    const registry = ChildrenHelper.createRegistry();

    element.innerHTML = '<div data-component="widget"></div>';
    ChildrenHelper.addChildren(component, element, registry);
    key = 2;
    element.innerHTML = '<div data-component="widget"></div>';
    ChildrenHelper.addChildren(component, element, registry);

    expect(created.length).toBe(2);
    expect(created[0].destroyed).toBe(true);
    expect(created[1].destroyed).toBe(false);
    expect(registry.keyed.size).toBe(1);
    expect(registry.reused.length).toBe(0);
  });

  it('keyed child whose placeholder disappeared is destroyed', () => {
    const created = [];
    const component = {
      registerChildren: () => [{
        selector: 'widget',
        key: 'w',
        factory: (el) => { const w = new Widget({ mountTarget: el }); created.push(w); return w; },
      }],
    };
    const registry = ChildrenHelper.createRegistry();

    element.innerHTML = '<div data-component="widget"></div>';
    ChildrenHelper.addChildren(component, element, registry);
    element.innerHTML = '';
    ChildrenHelper.addChildren(component, element, registry);

    expect(created[0].destroyed).toBe(true);
    expect(registry.keyed.size).toBe(0);
  });

  it('destroys removed children before creating new ones', () => {
    const order = [];
    let key = 1;
    const component = {
      registerChildren: () => [{
        selector: 'widget',
        key,
        factory: (el) => {
          const w = new Widget({ mountTarget: el });
          const id = key;
          order.push(`create ${id}`);
          w.onDestroy = () => order.push(`destroy ${id}`);
          return w;
        },
      }],
    };
    const registry = ChildrenHelper.createRegistry();

    element.innerHTML = '<div data-component="widget"></div>';
    ChildrenHelper.addChildren(component, element, registry);
    key = 2;
    element.innerHTML = '<div data-component="widget"></div>';
    ChildrenHelper.addChildren(component, element, registry);

    expect(order).toEqual(['create 1', 'destroy 1', 'create 2']);
  });

  it('the same key under two placeholders of one selector gives each its own identity', () => {
    const created = [];
    const component = {
      registerChildren: () => [{
        selector: 'widget',
        key: 'w',
        factory: (el) => { const w = new Widget({ mountTarget: el }); created.push(w); return w; },
      }],
    };
    const registry = ChildrenHelper.createRegistry();

    element.innerHTML = '<div data-component="widget"></div><div data-component="widget"></div>';
    ChildrenHelper.addChildren(component, element, registry);
    element.innerHTML = '<div data-component="widget"></div><div data-component="widget"></div>';
    ChildrenHelper.addChildren(component, element, registry);

    expect(created.length).toBe(2);
    expect(registry.reused.length).toBe(2);
  });

  it('warns about a duplicate key and recreates the duplicate on every render', () => {
    const warnSpy = spyOn(console, 'warn').andCallFake(() => {});
    const component = {
      registerChildren: () => [
        { selector: 'widget', key: 'w', factory: (el) => new Widget({ mountTarget: el }) },
        { selector: 'widget', key: 'w', factory: (el) => new Widget({ mountTarget: el }) },
      ],
    };
    const registry = ChildrenHelper.createRegistry();

    element.innerHTML = '<div data-component="widget"></div>';
    ChildrenHelper.addChildren(component, element, registry);
    warnSpy.restore();

    expect(warnSpy.callCount).toBe(1);
    expect(registry.keyed.size).toBe(1);
    expect(registry.unkeyed.length).toBe(1);
  });

  it('reuses a catalog-style child only when its reuseIf item, options and component are shallow-equal', () => {
    const created = [];
    let item = { id: 1, name: 'a' };
    let options = { tone: 'x' };
    const component = {
      registerChildren: () => [{
        selector: 'item-0',
        key: item.id,
        scope: 'catalog:list:item',
        reuseIf: { item, options, component: Widget },
        factory: (el) => { const w = new Widget({ mountTarget: el }); created.push(w); return w; },
      }],
    };
    const registry = ChildrenHelper.createRegistry();
    const rerender = () => {
      element.innerHTML = '<div data-component="item-0"></div>';
      ChildrenHelper.addChildren(component, element, registry);
    };

    rerender();
    item = { id: 1, name: 'a' };
    options = { tone: 'x' };
    rerender();
    expect(created.length).toBe(1);

    item = { id: 1, name: 'b' };
    rerender();
    expect(created.length).toBe(2);

    options = { tone: 'y' };
    rerender();
    expect(created.length).toBe(3);
  });

  it('recreates a catalog-style child when its reuseIf item changes between null, an object and an array', () => {
    const created = [];
    let item = null;
    const component = {
      registerChildren: () => [{
        selector: 'item-0',
        key: 1,
        scope: 'catalog:list:item',
        reuseIf: { item, options: undefined, component: Widget },
        factory: (el) => { const w = new Widget({ mountTarget: el }); created.push(w); return w; },
      }],
    };
    const registry = ChildrenHelper.createRegistry();
    const rerender = () => {
      element.innerHTML = '<div data-component="item-0"></div>';
      ChildrenHelper.addChildren(component, element, registry);
    };

    rerender();
    item = { 0: 'a' };
    rerender();
    expect(created.length).toBe(2);

    item = ['a'];
    rerender();
    expect(created.length).toBe(3);
  });

  it('ignores a non-HTML placeholder element', () => {
    let calls = 0;
    const component = {
      registerChildren: () => [{
        selector: 'icon',
        factory: (el) => { calls++; return new Widget({ mountTarget: el }); },
      }],
    };
    element.innerHTML = '<svg data-component="icon"></svg>';

    ChildrenHelper.addChildren(component, element, ChildrenHelper.createRegistry());

    expect(calls).toBe(0);
  });

  it('moves a kept child with Element.moveBefore when the browser supports it', () => {
    const moved = [];
    const proto = Element.prototype;
    proto.moveBefore = function (node, child) {
      moved.push(node);
      this.insertBefore(node, child);
    };

    try {
      const component = {
        registerChildren: () => [{ selector: 'widget', key: 'w', factory: (el) => new Widget({ mountTarget: el }) }],
      };
      const registry = ChildrenHelper.createRegistry();
      element.innerHTML = '<div data-component="widget"></div>';
      ChildrenHelper.addChildren(component, element, registry);
      const [{ instance }] = registry.keyed.values();

      // Stand-in for a parked child: still connected, outside the new placeholder.
      document.body.appendChild(instance.getElement());
      element.innerHTML = '<div data-component="widget"></div>';
      ChildrenHelper.addChildren(component, element, registry);

      expect(moved).toEqual([instance.getElement()]);
      expect(element.contains(instance.getElement())).toBe(true);
      expect(element.querySelector('[data-component="widget"]')).toBe(null);
    } finally {
      delete proto.moveBefore;
    }
  });
});
