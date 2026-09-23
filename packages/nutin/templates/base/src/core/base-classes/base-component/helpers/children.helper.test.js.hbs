import { ChildrenHelper } from '#root/dist/src/core/base-classes/base-component/helpers/children.helper.js';
import { BaseComponent } from '#root/dist/src/core/index.js';

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

    const children = [];
    ChildrenHelper.addChildren(component, element, children);

    expect(factoryCalls.length).toBe(1);
    expect(factoryCalls[0]).toBe(element.querySelector('[data-component="widget"]'));
    expect(rendered.length).toBe(1);
    expect(children.length).toBe(1);
  });

  it('instantiates one child per matched element for a single registerChildren entry', () => {
    element.innerHTML = '<div data-component="widget"></div><div data-component="widget"></div>';
    const component = {
      registerChildren: () => [{
        selector: 'widget',
        factory: () => ({ render: () => {}, destroy: () => {} }),
      }],
    };

    const children = [];
    ChildrenHelper.addChildren(component, element, children);

    expect(children.length).toBe(2);
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

    const children = [];
    ChildrenHelper.addChildren(component, element, children);

    const childEl = children[0].getElement();
    expect(element.contains(childEl)).toBe(true);
    expect(childEl.classList.contains('my-class')).toBe(true);
    expect(childEl.id).toBe('my-widget');
    expect(childEl.hasAttribute('data-component')).toBe(false);
    expect(childEl.innerHTML).toBe('<p>widget</p>');
  });

  it('does nothing when there are no registerChildren', () => {
    const component = { registerChildren: () => [] };
    const children = [];
    ChildrenHelper.addChildren(component, element, children);
    expect(children.length).toBe(0);
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

    const children = [];
    ChildrenHelper.addChildren(component, element, children);
    expect(children.length).toBe(1);
    expect(destroyCount).toBe(0);

    element.innerHTML = '<div data-component="widget"></div>';
    ChildrenHelper.addChildren(component, element, children);

    expect(destroyCount).toBe(1);
    expect(children.length).toBe(1);
  });

  it('destroyChildren calls destroy on every child', () => {
    let destroyCount = 0;
    const children = [
      { destroy: () => destroyCount++ },
      { destroy: () => destroyCount++ },
    ];
    ChildrenHelper.destroyChildren(children);
    expect(destroyCount).toBe(2);
  });
});
