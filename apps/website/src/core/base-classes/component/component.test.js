import { Component } from '#root/dist/src/core/index.js';

class TestComponent extends Component {
  constructor(options = {}) {
    super(options);
  }
}

describe('Component', () => {
  let app;

  beforeEach(() => {
    app = document.getElementById('app');
  });

  afterEach(() => {
    app.innerHTML = '';
    app = null;
  });

  it('getValues() delegates to DataBindingHelper.getDataBindingValues on the element', () => {
    const component = new TestComponent();
    component.getElement().innerHTML = '<input data-bind="name" value="Ada">';
    expect(component.getValues()).toEqual({ name: 'Ada' });
  });

  it('generateTemplate() delegates to ConfigHelper.createNormalizedTemplate using config/defaults/normalizeKeys/templateFn', () => {
    const component = new TestComponent({
      config: { name: undefined },
      defaults: { name: 'fallback', greeting: 'hi' },
      normalizeKeys: ['name'],
      templateFn: (cfg) => `<span>${cfg.greeting} ${cfg.name}</span>`,
    });

    component.render();

    expect(component.getElement().innerHTML).toBe('<span>hi </span>');
  });

  it('onBeforeRender applies props.className to the element on render', () => {
    const component = new TestComponent({ props: { className: 'highlight' } });
    component.render();
    expect(component.getElement().classList.contains('highlight')).toBe(true);
  });

  it('onBeforeRender applies a space-separated props.className as several classes', () => {
    const component = new TestComponent({ props: { className: ' btn  primary ' } });
    component.render();
    expect(component.getElement().classList.contains('btn')).toBe(true);
    expect(component.getElement().classList.contains('primary')).toBe(true);
  });

  it('onBeforeRender applies props.style as cssText on render', () => {
    const component = new TestComponent({ props: { style: 'color: red;' } });
    component.render();
    expect(component.getElement().style.color).toBe('red');
  });

  it('applies props-based data-bindings to the rendered template', () => {
    const component = new TestComponent({
      templateFn: () => '<span data-bind="name"></span>',
      props: { name: 'Ada' },
    });

    component.render();

    expect(component.getElement().querySelector('span').textContent).toBe('Ada');
  });

  it('applies data-bindings in onAfterRender, so a subclass sees them once it calls super', () => {
    let seen = null;
    class BoundComponent extends Component {
      onAfterRender() {
        super.onAfterRender();
        seen = this.getElement().querySelector('span').textContent;
      }
    }
    const component = new BoundComponent({
      templateFn: () => '<span data-bind="name"></span>',
      props: { name: 'Ada' },
    });
    component.render();
    expect(seen).toBe('Ada');
  });
});
