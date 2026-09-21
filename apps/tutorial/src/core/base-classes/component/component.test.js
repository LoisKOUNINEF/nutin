import { Component } from '#root/dist/src/core/index.js';
import { DataBindingHelper } from '#root/dist/src/core/base-classes/component/helpers/data-binding.helper.js';

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

  it('onAfterRender calls DataBindingHelper.applyDataBindings with the element and props, after the template has been written', () => {
    // onAfterRender runs after render() sets innerHTML from generateTemplate(),
    // so the template's own [data-bind] nodes already exist by the time this fires.
    const calls = [];
    const spy = spyOn(DataBindingHelper, 'applyDataBindings');
    spy.andCallFake((element, props) => {
      calls.push({ props, htmlAtCallTime: element.innerHTML });
    });

    const component = new TestComponent({
      templateFn: () => '<span data-bind="name"></span>',
      props: { name: 'Ada' },
    });
    component.render();

    expect(calls.length).toBe(1);
    expect(calls[0].props).toEqual({ name: 'Ada' });
    expect(calls[0].htmlAtCallTime).toBe('<span data-bind="name"></span>');

    spy.restore();
  });
});
