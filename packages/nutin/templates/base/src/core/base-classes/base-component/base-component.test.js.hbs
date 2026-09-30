import { BaseComponent, AppEventBus, AppPipeRegistry } from '#root/dist/src/core/index.js';

class TestComponent extends BaseComponent {
  constructor(options = {}, hooks = {}) {
    super(options);
    this.hooks = hooks;
    this.calls = [];
  }
  generateTemplate() {
    this.calls.push('generateTemplate');
    return this.hooks.template ?? '';
  }
  onBeforeRender() {
    this.calls.push('onBeforeRender');
    this.hooks.onBeforeRender?.(this);
  }
  onAfterRender() {
    this.calls.push('onAfterRender');
  }
  onBeforeDestroy() {
    this.calls.push('onBeforeDestroy');
  }
  onAfterDestroy() {
    this.calls.push('onAfterDestroy');
  }
  compose() {
    this.calls.push('compose');
    super.compose();
  }
  hydrate() {
    this.calls.push('hydrate');
    super.hydrate();
  }
  autoBindEvents() {
    this.calls.push('autoBindEvents');
    super.autoBindEvents();
  }
}

class InputChild extends BaseComponent {
  constructor(options) {
    super(options);
    this.renders = 0;
    this.reuses = 0;
  }
  generateTemplate() { return '<input>'; }
  onBeforeRender() { this.renders++; }
  onReuse() { this.reuses++; }
}

class KeyedParent extends BaseComponent {
  constructor(options = {}, childTemplate = '<div data-component="child"></div>') {
    super(options);
    this.childTemplate = childTemplate;
    this.key = 'a';
    this.created = [];
  }
  generateTemplate() { return `<h1>parent</h1>${this.childTemplate}`; }
  registerChildren() {
    return [{
      selector: 'child',
      key: this.key,
      factory: (el) => {
        const child = new InputChild({ mountTarget: el });
        this.created.push(child);
        return child;
      },
    }];
  }
}

class LoggingChild extends BaseComponent {
  constructor(options, log, name, hooks = {}) {
    super(options);
    this.log = log;
    this.name = name;
    this.hooks = hooks;
    this.reuses = 0;
  }
  generateTemplate() { return this.hooks.template ?? `<input class="${this.name}">`; }
  registerChildren() { return this.hooks.children?.(this) ?? []; }
  onBeforeRender() { this.log.push(`${this.name}:render`); }
  onReuse() {
    this.reuses++;
    this.log.push(`${this.name}:reuse`);
    this.hooks.onReuse?.(this);
  }
}

class LoggingParent extends BaseComponent {
  constructor(log, hooks = {}) {
    super({});
    this.log = log;
    this.hooks = hooks;
    this.children = [];
  }
  generateTemplate() { return this.hooks.template ?? '<div data-component="a"></div><div data-component="b"></div>'; }
  registerChildren() {
    return this.hooks.children?.(this) ?? ['a', 'b'].map(name => ({
      selector: name,
      key: name,
      factory: (el) => {
        const child = new LoggingChild({ mountTarget: el }, this.log, name, this.hooks.childHooks?.[name]);
        this.children.push(child);
        return child;
      },
    }));
  }
  compose() {
    this.log.push('parent:compose');
    if (this.hooks.compose) this.hooks.compose(this);
    else super.compose();
  }
  hydrate() {
    this.log.push('parent:hydrate');
    super.hydrate();
  }
  onAfterRender() { this.log.push('parent:afterRender'); }
}

describe('BaseComponent', () => {
  let app;

  beforeEach(() => {
    // dist/src/index.html already ships a real <main id="app">, so reuse it
    // instead of appending a second element with the same id.
    app = document.getElementById('app');
  });

  afterEach(() => {
    AppEventBus.cleanupEventListeners();
    app.innerHTML = '';
    app = null;
  });

  it('mounts its element into the default "#app" target on construction', () => {
    const component = new TestComponent();
    expect(app.contains(component.getElement())).toBe(true);
  });

  it('creates the element with the given tagName', () => {
    const component = new TestComponent({ tagName: 'section' });
    expect(component.getElement().tagName).toBe('SECTION');
  });

  it('defaults registerChildren() to an empty array', () => {
    const component = new TestComponent();
    expect(component.registerChildren()).toEqual([]);
  });

  it('render() runs the full pipeline in order', () => {
    const component = new TestComponent({}, { template: '<span>hi</span>' });
    component.render();
    expect(component.calls).toEqual([
      'onBeforeRender',
      'generateTemplate',
      'compose',
      'hydrate',
      'autoBindEvents',
      'onAfterRender',
    ]);
    expect(component.getElement().innerHTML).toBe('<span>hi</span>');
  });

  it('render() sanitizes the generated template before inserting it', () => {
    const component = new TestComponent({}, { template: '<p>hi</p><script>bad()</script>' });
    component.render();
    expect(component.getElement().innerHTML).toBe('<p>hi</p>');
  });

  it('render() guards against re-entrant rendering and returns the existing element', () => {
    let innerResult;
    const component = new TestComponent({}, {
      onBeforeRender: (self) => {
        innerResult = self.render();
      },
    });

    const outerResult = component.render();

    expect(innerResult).toBe(outerResult);
    expect(component.calls.filter(c => c === 'compose').length).toBe(1);
    expect(component.calls.filter(c => c === 'onBeforeRender').length).toBe(1);
  });

  it('destroy() runs onBeforeDestroy then onAfterDestroy and removes the element from the DOM', () => {
    const component = new TestComponent();
    component.render();
    const el = component.getElement();
    const callsBeforeDestroy = component.calls.length;

    component.destroy();

    const destroyCalls = component.calls.slice(callsBeforeDestroy);
    expect(destroyCalls).toEqual(['onBeforeDestroy', 'onAfterDestroy']);
    expect(app.contains(el)).toBe(false);
  });

  it('listen() subscribes via AppEventBus and stops receiving events after destroy()', () => {
    const component = new TestComponent();
    let received = null;
    component.listen('user-login', (data) => { received = data; });

    AppEventBus.emit('user-login', { id: 1 });
    expect(received).toEqual({ id: 1 });

    component.destroy();
    received = null;
    AppEventBus.emit('user-login', { id: 2 });
    expect(received).toBe(null);
  });

  it('listenToRenderEvents() triggers render() whenever one of the given events fires', () => {
    const component = new TestComponent();
    component.listenToRenderEvents(['user-login']);

    const before = component.calls.filter(c => c === 'onBeforeRender').length;
    AppEventBus.emit('user-login', {});
    const after = component.calls.filter(c => c === 'onBeforeRender').length;

    expect(after).toBe(before + 1);
    component.destroy();
  });

  it('createCatalogComponents() delegates to CatalogHelper.generateCatalog scoped to the component element', () => {
    const component = new TestComponent();
    component.getElement().innerHTML = '<div data-catalog="list"></div>';

    const configs = component.createCatalogComponents({
      items: [{ id: 1 }],
      selector: 'list',
      elementName: 'item',
      component: class {},
    });

    expect(configs.length).toBe(1);
    component.destroy();
  });

  it('render() keeps a keyed child, its typed value and focus across a parent re-render, and calls onReuse() on it', () => {
    const parent = new KeyedParent();
    parent.render();
    const [child] = parent.created;
    const input = child.getElement().querySelector('input');
    input.value = 'typed';
    input.focus();

    parent.render();

    expect(parent.created.length).toBe(1);
    expect(child.renders).toBe(1);
    expect(child.reuses).toBe(1);
    expect(parent.getElement().contains(input)).toBe(true);
    expect(input.value).toBe('typed');
    expect(document.activeElement).toBe(input);
    parent.destroy();
  });

  it('render() recreates a keyed child whose key changed and does not call onReuse() on the new one', () => {
    const parent = new KeyedParent();
    parent.render();
    parent.key = 'b';

    parent.render();

    expect(parent.created.length).toBe(2);
    expect(parent.created[0].reuses).toBe(0);
    expect(parent.created[1].reuses).toBe(0);
    expect(parent.getElement().contains(parent.created[0].getElement())).toBe(false);
    parent.destroy();
  });

  it('destroy() destroys kept keyed children too', () => {
    const parent = new KeyedParent();
    parent.render();
    parent.render();
    const childEl = parent.created[0].getElement();

    parent.destroy();

    expect(childEl.isConnected).toBe(false);
  });

  it('render() keeps trackBy catalog items that did not change and recreates the ones that did', () => {
    class Item extends BaseComponent {
      constructor(el, data) {
        super({ mountTarget: el });
        this.data = data;
      }
      generateTemplate() { return `<span>${this.data.name}</span>`; }
    }
    class List extends BaseComponent {
      constructor() {
        super({});
        this.items = [{ id: 1, name: 'a' }, { id: 2, name: 'b' }];
      }
      generateTemplate() { return '<ul data-catalog="list"></ul>'; }
      registerChildren() {
        return this.createCatalogComponents({
          items: this.items,
          selector: 'list',
          elementName: 'item',
          elementTag: 'li',
          component: Item,
          trackBy: (item) => item.id,
        });
      }
    }
    const list = new List();
    list.render();
    const [first, second] = Array.from(list.getElement().querySelectorAll('span'));

    list.items = [{ id: 0, name: 'new' }, { id: 1, name: 'a' }, { id: 2, name: 'changed' }];
    list.render();

    const spans = Array.from(list.getElement().querySelectorAll('span'));
    expect(spans.map(span => span.textContent)).toEqual(['new', 'a', 'changed']);
    expect(spans[1]).toBe(first);
    expect(spans[2]).not.toBe(second);
    expect(Array.from(list.getElement().querySelectorAll('li')).map(li => li.dataset.index)).toEqual(['0', '1', '2']);
    list.destroy();
  });

  it('render() does not pipe a kept child\'s content again', () => {
    silenceConsole('warn', () => AppPipeRegistry.register('baseComponentExclaim', (value) => `${value}!`));
    class PipedChild extends BaseComponent {
      generateTemplate() { return '<span data-pipe="baseComponentExclaim">hi</span>'; }
    }
    class Parent extends BaseComponent {
      generateTemplate() { return '<div data-component="child"></div>'; }
      registerChildren() {
        return [{ selector: 'child', key: 'c', factory: (el) => new PipedChild({ mountTarget: el }) }];
      }
    }
    const parent = new Parent({});

    parent.render();
    parent.render();

    expect(parent.getElement().querySelector('span').textContent).toBe('hi!');
    parent.destroy();
  });

  it('render() parks keyed children with moveBefore and leaves no parking element behind', () => {
    const moved = [];
    Element.prototype.moveBefore = function (node, child) {
      moved.push(node);
      this.insertBefore(node, child);
    };

    try {
      const parent = new KeyedParent();
      parent.render();
      const childEl = parent.created[0].getElement();
      const bodyChildren = document.body.children.length;

      parent.render();

      expect(moved).toEqual([childEl, childEl]);
      expect(parent.getElement().contains(childEl)).toBe(true);
      expect(document.body.children.length).toBe(bodyChildren);
      parent.destroy();
    } finally {
      delete Element.prototype.moveBefore;
    }
  });

  it('onReuse() runs once per parent re-render, for every kept child', () => {
    const parent = new LoggingParent([]);
    parent.render();
    parent.render();
    parent.render();

    expect(parent.children.length).toBe(2);
    expect(parent.children.map(child => child.reuses)).toEqual([2, 2]);
    parent.destroy();
  });

  it('onReuse() runs after compose() with the child back in place, before the parent hydrates and runs onAfterRender()', () => {
    const log = [];
    let connectedAtReuse;
    const parent = new LoggingParent(log, {
      childHooks: { a: { onReuse: (child) => { connectedAtReuse = parent.getElement().contains(child.getElement()) && child.getElement().isConnected; } } },
    });
    parent.render();
    log.length = 0;

    parent.render();

    expect(log).toEqual(['parent:compose', 'a:reuse', 'b:reuse', 'parent:hydrate', 'parent:afterRender']);
    expect(connectedAtReuse).toBe(true);
    parent.destroy();
  });

  it('onReuse() is not called on a child created by the same render, even when a sibling is kept', () => {
    const log = [];
    let bKey = 'b';
    const parent = new LoggingParent(log, {
      children: (self) => [
        { selector: 'a', key: 'a', factory: (el) => { const c = new LoggingChild({ mountTarget: el }, log, 'a'); self.children.push(c); return c; } },
        { selector: 'b', key: bKey, factory: (el) => { const c = new LoggingChild({ mountTarget: el }, log, 'b'); self.children.push(c); return c; } },
      ],
    });
    parent.render();
    bKey = 'b2';
    log.length = 0;

    parent.render();

    expect(log.filter(entry => entry.endsWith(':reuse'))).toEqual(['a:reuse']);
    expect(log.filter(entry => entry.endsWith(':render'))).toEqual(['b:render']);
    parent.destroy();
  });

  it('onReuse() is called on unchanged trackBy catalog items only', () => {
    const reused = [];
    class Item extends BaseComponent {
      constructor(el, data) {
        super({ mountTarget: el });
        this.data = data;
      }
      generateTemplate() { return `<span>${this.data.name}</span>`; }
      onReuse() { reused.push(this.data.name); }
    }
    class List extends BaseComponent {
      constructor() {
        super({});
        this.items = [{ id: 1, name: 'a' }, { id: 2, name: 'b' }, { id: 3, name: 'c' }];
      }
      generateTemplate() { return '<ul data-catalog="list"></ul>'; }
      registerChildren() {
        return this.createCatalogComponents({
          items: this.items, selector: 'list', elementName: 'item', component: Item, trackBy: (item) => item.id,
        });
      }
    }
    const list = new List();
    list.render();
    list.items = [{ id: 4, name: 'new' }, { id: 1, name: 'a' }, { id: 2, name: 'changed' }];

    list.render();

    expect(reused).toEqual(['a']);
    list.destroy();
  });

  it('onReuse() is not called on children of a kept child, which are left untouched', () => {
    const log = [];
    const parent = new LoggingParent(log, {
      template: '<div data-component="a"></div>',
      children: (self) => [{
        selector: 'a',
        key: 'a',
        factory: (el) => {
          const child = new LoggingChild({ mountTarget: el }, log, 'a', {
            template: '<div data-component="inner"></div>',
            children: () => [{ selector: 'inner', key: 'inner', factory: (innerEl) => new LoggingChild({ mountTarget: innerEl }, log, 'inner') }],
          });
          self.children.push(child);
          return child;
        },
      }],
    });
    parent.render();
    log.length = 0;

    parent.render();

    expect(log).toEqual(['parent:compose', 'a:reuse', 'parent:hydrate', 'parent:afterRender']);
    parent.destroy();
  });

  it('onReuse() is not called when compose() is overridden without calling super, and is not replayed later', () => {
    const log = [];
    let skipCompose = false;
    const parent = new LoggingParent(log, {
      compose: (self) => { if (!skipCompose) BaseComponent.prototype.compose.call(self); },
    });
    parent.render();
    parent.render();
    expect(parent.children.map(child => child.reuses)).toEqual([1, 1]);

    skipCompose = true;
    parent.render();
    expect(parent.children.map(child => child.reuses)).toEqual([1, 1]);

    // compose() runs again: the still-registered children are kept, not recreated.
    skipCompose = false;
    parent.render();
    expect(parent.children.length).toBe(2);
    expect(parent.children.map(child => child.reuses)).toEqual([2, 2]);
    parent.destroy();
  });

  it('onReuse() is skipped when compose() throws, and the next render reuses normally', () => {
    const log = [];
    let fail = false;
    const parent = new LoggingParent(log, {
      compose: (self) => {
        BaseComponent.prototype.compose.call(self);
        if (fail) throw new Error('compose failed');
      },
    });
    parent.render();

    fail = true;
    expect(() => parent.render()).toThrow('compose failed');
    expect(parent.children.map(child => child.reuses)).toEqual([0, 0]);

    fail = false;
    parent.render();
    expect(parent.children.length).toBe(2);
    expect(parent.children.map(child => child.reuses)).toEqual([1, 1]);
    expect(parent.getElement().contains(parent.children[0].getElement())).toBe(true);
    parent.destroy();
  });

  it('onReuse() can re-render the kept child itself, which stays in place', () => {
    const log = [];
    let text = 'first';
    const parent = new LoggingParent(log, {
      template: '<div data-component="a"></div>',
      children: (self) => [{
        selector: 'a',
        key: 'a',
        factory: (el) => {
          const child = new LoggingChild({ mountTarget: el }, log, 'a', {
            onReuse: (c) => c.render(),
          });
          child.generateTemplate = () => `<p>${text}</p>`;
          self.children.push(child);
          return child;
        },
      }],
    });
    parent.render();
    text = 'second';

    parent.render();

    const [child] = parent.children;
    expect(parent.children.length).toBe(1);
    expect(parent.getElement().contains(child.getElement())).toBe(true);
    expect(child.getElement().innerHTML).toBe('<p>second</p>');
    parent.destroy();
  });

  it('onReuse() re-rendering the parent is a no-op thanks to the re-entrancy guard', () => {
    const log = [];
    const parent = new LoggingParent(log, {
      template: '<div data-component="a"></div>',
      children: (self) => [{
        selector: 'a',
        key: 'a',
        factory: (el) => {
          const child = new LoggingChild({ mountTarget: el }, log, 'a', { onReuse: () => parent.render() });
          self.children.push(child);
          return child;
        },
      }],
    });
    parent.render();
    log.length = 0;

    parent.render();

    expect(log.filter(entry => entry === 'parent:compose').length).toBe(1);
    expect(parent.children.length).toBe(1);
    parent.destroy();
  });

  it('onReuse() sees restored focus on the detach-and-reinsert fallback path', () => {
    let focusedAtReuse;
    const parent = new LoggingParent([], {
      template: '<div data-component="a"></div>',
      children: (self) => [{
        selector: 'a',
        key: 'a',
        factory: (el) => {
          const child = new LoggingChild({ mountTarget: el }, [], 'a', {
            onReuse: (c) => { focusedAtReuse = document.activeElement === c.getElement().querySelector('input'); },
          });
          self.children.push(child);
          return child;
        },
      }],
    });
    parent.render();
    parent.children[0].getElement().querySelector('input').focus();

    parent.render();

    expect(focusedAtReuse).toBe(true);
    parent.destroy();
  });

  it('onReuse() runs on the moveBefore path too, with the child already moved in place', () => {
    Element.prototype.moveBefore = function (node, child) {
      this.insertBefore(node, child);
    };

    try {
      let inPlaceAtReuse;
      const parent = new LoggingParent([], {
        childHooks: { a: { onReuse: (child) => { inPlaceAtReuse = parent.getElement().contains(child.getElement()); } } },
      });
      parent.render();

      parent.render();

      expect(parent.children.map(child => child.reuses)).toEqual([1, 1]);
      expect(inPlaceAtReuse).toBe(true);
      parent.destroy();
    } finally {
      delete Element.prototype.moveBefore;
    }
  });
});
