import { BaseComponent, AppEventBus } from '#root/dist/src/core/index.js';

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

  it('defaults childConfigs() to an empty array', () => {
    const component = new TestComponent();
    expect(component.childConfigs()).toEqual([]);
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

  it('catalogConfig() delegates to CatalogHelper.generateCatalog scoped to the component element', () => {
    const component = new TestComponent();
    component.getElement().innerHTML = '<div data-catalog="list"></div>';

    const configs = component.catalogConfig({
      array: [{ id: 1 }],
      selector: 'list',
      elementName: 'item',
      component: class {},
    });

    expect(configs.length).toBe(1);
    component.destroy();
  });
});
