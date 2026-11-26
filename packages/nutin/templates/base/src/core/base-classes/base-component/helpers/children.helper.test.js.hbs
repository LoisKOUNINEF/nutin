import * as ChildrenHelper from '#root/dist/src/core/base-classes/base-component/helpers/children.helper.js';
import { BaseComponent, getChildComponents, html, nutinFor } from '#root/dist/src/core/index.js';

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
    expect(registry.rebuilt.length).toBe(1);
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

    expect(registry.rebuilt.length).toBe(2);
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

    const childEl = registry.rebuilt[0].getElement();
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
    expect(registry.rebuilt.length).toBe(0);
    expect(registry.keepable.size).toBe(0);
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
    expect(registry.rebuilt.length).toBe(1);
    expect(destroyCount).toBe(0);

    element.innerHTML = '<div data-component="widget"></div>';
    ChildrenHelper.addChildren(component, element, registry);

    expect(destroyCount).toBe(1);
    expect(registry.rebuilt.length).toBe(1);
  });

  it('destroyChildren calls destroy on every keepable and rebuilt child and empties the registry', () => {
    let destroyCount = 0;
    const registry = ChildrenHelper.createRegistry();
    registry.rebuilt.push({ destroy: () => destroyCount++ });
    registry.keepable.set('a', { instance: { destroy: () => destroyCount++ } });
    ChildrenHelper.destroyChildren(registry);
    expect(destroyCount).toBe(2);
    expect(registry.rebuilt.length).toBe(0);
    expect(registry.keepable.size).toBe(0);
  });

  it('child with an unchanged keep value is moved into the new placeholder without calling its factory or rendering it', () => {
    const created = [];
    const component = {
      registerChildren: () => [{
        selector: 'widget',
        keep: 'w',
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
    expect(registry.kept).toEqual([created[0]]);
  });

  it('child whose keep value changed is destroyed and recreated', () => {
    let keep = 1;
    const created = [];
    const component = {
      registerChildren: () => [{
        selector: 'widget',
        keep,
        factory: (el) => { const w = new Widget({ mountTarget: el }); created.push(w); return w; },
      }],
    };
    const registry = ChildrenHelper.createRegistry();

    element.innerHTML = '<div data-component="widget"></div>';
    ChildrenHelper.addChildren(component, element, registry);
    keep = 2;
    element.innerHTML = '<div data-component="widget"></div>';
    ChildrenHelper.addChildren(component, element, registry);

    expect(created.length).toBe(2);
    expect(created[0].destroyed).toBe(true);
    expect(created[1].destroyed).toBe(false);
    expect(registry.keepable.size).toBe(1);
    expect(registry.kept.length).toBe(0);
  });

  it('keepable child whose placeholder disappeared is destroyed', () => {
    const created = [];
    const component = {
      registerChildren: () => [{
        selector: 'widget',
        keep: 'w',
        factory: (el) => { const w = new Widget({ mountTarget: el }); created.push(w); return w; },
      }],
    };
    const registry = ChildrenHelper.createRegistry();

    element.innerHTML = '<div data-component="widget"></div>';
    ChildrenHelper.addChildren(component, element, registry);
    element.innerHTML = '';
    ChildrenHelper.addChildren(component, element, registry);

    expect(created[0].destroyed).toBe(true);
    expect(registry.keepable.size).toBe(0);
  });

  it('destroys removed children before creating new ones', () => {
    const order = [];
    let keep = 1;
    const component = {
      registerChildren: () => [{
        selector: 'widget',
        keep,
        factory: (el) => {
          const w = new Widget({ mountTarget: el });
          const id = keep;
          order.push(`create ${id}`);
          w.onDestroy = () => order.push(`destroy ${id}`);
          return w;
        },
      }],
    };
    const registry = ChildrenHelper.createRegistry();

    element.innerHTML = '<div data-component="widget"></div>';
    ChildrenHelper.addChildren(component, element, registry);
    keep = 2;
    element.innerHTML = '<div data-component="widget"></div>';
    ChildrenHelper.addChildren(component, element, registry);

    expect(order).toEqual(['create 1', 'destroy 1', 'create 2']);
  });

  it('the same keep value under two placeholders of one selector gives each its own identity', () => {
    const created = [];
    const component = {
      registerChildren: () => [{
        selector: 'widget',
        keep: 'w',
        factory: (el) => { const w = new Widget({ mountTarget: el }); created.push(w); return w; },
      }],
    };
    const registry = ChildrenHelper.createRegistry();

    element.innerHTML = '<div data-component="widget"></div><div data-component="widget"></div>';
    ChildrenHelper.addChildren(component, element, registry);
    element.innerHTML = '<div data-component="widget"></div><div data-component="widget"></div>';
    ChildrenHelper.addChildren(component, element, registry);

    expect(created.length).toBe(2);
    expect(registry.kept.length).toBe(2);
  });

  it('warns about a duplicate keep value and recreates the duplicate on every render', () => {
    const warnSpy = spyOn(console, 'warn').andCallFake(() => {});
    try {
      const component = {
        registerChildren: () => [
          { selector: 'widget', keep: 'w', factory: (el) => new Widget({ mountTarget: el }) },
          { selector: 'widget', keep: 'w', factory: (el) => new Widget({ mountTarget: el }) },
        ],
      };
      const registry = ChildrenHelper.createRegistry();

      element.innerHTML = '<div data-component="widget"></div>';
      ChildrenHelper.addChildren(component, element, registry);

      expect(warnSpy.callCount).toBe(1);
      expect(registry.keepable.size).toBe(1);
      expect(registry.rebuilt.length).toBe(1);
    } finally {
      warnSpy.restore();
    }
  });

  it('keptCount a catalog-style child only when its keepIf item, options and component are shallow-equal', () => {
    const created = [];
    let item = { id: 1, name: 'a' };
    let options = { tone: 'x' };
    const component = {
      registerChildren: () => [{
        selector: 'item-0',
        keep: item.id,
        scope: 'catalog:list:item',
        keepIf: { item, options, component: Widget },
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

  it('recreates a catalog-style child when its keepIf item changes between null, an object and an array', () => {
    const created = [];
    let item = null;
    const component = {
      registerChildren: () => [{
        selector: 'item-0',
        keep: 1,
        scope: 'catalog:list:item',
        keepIf: { item, options: undefined, component: Widget },
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
        registerChildren: () => [{ selector: 'widget', keep: 'w', factory: (el) => new Widget({ mountTarget: el }) }],
      };
      const registry = ChildrenHelper.createRegistry();
      element.innerHTML = '<div data-component="widget"></div>';
      ChildrenHelper.addChildren(component, element, registry);
      const [{ instance }] = registry.keepable.values();

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

  describe('getChildComponents', () => {
    class Other extends BaseComponent {}
    class SpecialWidget extends Widget {}

    class Parent extends BaseComponent {
      constructor(mountTarget, { template, children }) {
        super({ mountTarget });
        this.template = template;
        this.children = children;
      }
      generateTemplate() { return this.template; }
      registerChildren() { return this.children(this); }
    }
    const child = (selector, Type = Widget, keep) => ({ selector, keep, factory: (el) => new Type({ mountTarget: el }) });

    it('returns the children of the given class, and [] when there is none', () => {
      const parent = new Parent(element, {
        template: '<div data-component="widget"></div><div data-component="other"></div>',
        children: () => [child('widget'), child('other', Other)],
      });
      parent.render();

      const widgets = getChildComponents(parent, Widget);
      const others = getChildComponents(parent, Other);

      expect(widgets.length).toBe(1);
      expect(widgets[0]).toBeInstanceOf(Widget);
      expect(others.length).toBe(1);
      expect(others[0]).not.toBe(widgets[0]);
      expect(getChildComponents(parent, SpecialWidget)).toEqual([]);
      parent.destroy();
    });

    it('returns children of subclasses for a base class', () => {
      const parent = new Parent(element, {
        template: '<div data-component="widget"></div><div data-component="special"></div>',
        children: () => [child('widget'), child('special', SpecialWidget)],
      });
      parent.render();

      expect(getChildComponents(parent, Widget).length).toBe(2);
      expect(getChildComponents(parent, SpecialWidget).length).toBe(1);
      expect(getChildComponents(parent, BaseComponent).length).toBe(2);
      parent.destroy();
    });

    it('returns two placeholders of the same class in DOM order, told apart by the attributes copied from them', () => {
      const parent = new Parent(element, {
        template: '<div class="main" data-component="main"></div><div class="side" data-component="side"></div>',
        children: () => [child('side'), child('main')],
      });
      parent.render();

      const widgets = getChildComponents(parent, Widget);

      expect(widgets.map(widget => widget.getElement().className)).toEqual(['main', 'side']);
      expect(widgets.find(widget => widget.getElement().matches('.side'))).toBe(widgets[1]);
      parent.destroy();
    });

    it('returns one instance per placeholder repeated in nutinFor items, in DOM order', () => {
      const parent = new Parent(element, {
        template: html`<ul>${nutinFor(['x', 'y', 'z'], (item) => html`<li data-item="${item}"><div data-component="widget"></div></li>`)}</ul>`,
        children: () => [child('widget')],
      });
      parent.render();

      const widgets = getChildComponents(parent, Widget);

      expect(widgets.map(widget => widget.getElement().parentElement.dataset.item)).toEqual(['x', 'y', 'z']);
      expect(new Set(widgets).size).toBe(3);
      parent.destroy();
    });

    it('includes catalog items of that class', () => {
      const parent = new Parent(element, {
        template: '<div data-component="widget"></div><ul data-catalog="list"></ul>',
        children: (self) => [child('widget'), ...self.createCatalogComponents({
          items: [{ id: 1 }, { id: 2 }], selector: 'list', elementName: 'item', component: class extends Widget {
            constructor(el) { super({ mountTarget: el }); }
          },
        })],
      });
      parent.render();

      expect(getChildComponents(parent, Widget).length).toBe(3);
      parent.destroy();
    });

    it('returns the kept instance after a re-render, and a new one for a child without keep', () => {
      const parent = new Parent(element, {
        template: '<div data-component="widget"></div><div data-component="other"></div>',
        children: () => [child('widget', Widget, 'w'), child('other', Other)],
      });
      parent.render();
      const [kept] = getChildComponents(parent, Widget);
      const [rebuilt] = getChildComponents(parent, Other);

      parent.render();

      expect(getChildComponents(parent, Widget)[0]).toBe(kept);
      expect(getChildComponents(parent, Other)[0]).not.toBe(rebuilt);
      expect(rebuilt.isDestroyed).toBe(true);
      parent.destroy();
    });

    it('skips the children of nested components', () => {
      const parent = new Parent(element, {
        template: '<div data-component="widget"></div><div data-component="host"></div>',
        children: () => [child('widget'), {
          selector: 'host',
          factory: (el) => new Parent(el, { template: '<div data-component="widget"></div>', children: () => [child('widget')] }),
        }],
      });
      parent.render();
      const [host] = getChildComponents(parent, Parent);
      const [inner] = getChildComponents(host, Widget);

      const widgets = getChildComponents(parent, Widget);

      expect(inner).toBeInstanceOf(Widget);
      expect(widgets.length).toBe(1);
      expect(widgets.includes(inner)).toBe(false);
      parent.destroy();
    });

    it('returns [] once the placeholder is gone from the template', () => {
      const parent = new Parent(element, {
        template: '<div data-component="widget"></div>',
        children: () => [child('widget')],
      });
      parent.render();
      const [first] = getChildComponents(parent, Widget);

      parent.template = '<p>no widget</p>';
      parent.render();

      expect(getChildComponents(parent, Widget)).toEqual([]);
      expect(first.isDestroyed).toBe(true);
      parent.destroy();
    });
  });
});
