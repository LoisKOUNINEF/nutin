import { A11yDemoElementsComponent } from '#root/dist/src/app/components/a11y-elements/a11y-demo-elements/a11y-demo-elements.component.js';
import { Navigation } from '#root/dist/src/core/index.js';

const ELEMENTS = [
  'a11y-anchor', 'a11y-avatar', 'a11y-card-link', 'a11y-checkbox', 'a11y-checkbox-group', 'a11y-file-input', 'a11y-focusable',
  'a11y-input', 'a11y-label', 'a11y-picture', 'a11y-progress', 'a11y-radio-group', 'a11y-select',
  'a11y-skeleton', 'a11y-spinner', 'a11y-switch', 'a11y-tabs', 'a11y-textarea', 'a11y-visually-hidden',
];

function mount() {
  const target = document.createElement('div');
  document.body.appendChild(target);
  const component = new A11yDemoElementsComponent(target);
  component.render();
  return component;
}

describe('A11yDemoElementsComponent', () => {
  beforeAll(() => {
    setupJsdom();
  });

  it('showcases every accessibility component', () => {
    const component = mount();
    for (const tag of ELEMENTS) {
      expect(component.element.querySelector(tag)).toBeTruthy();
    }
    // One section per element, plus the getValue()/setValue() one.
    expect(component.element.querySelectorAll('.a11y-demo__section').length).toBe(ELEMENTS.length + 1);
    component.destroy();
  });

  it('steps the progress value by 20 and wraps back to 0 after 100', () => {
    const component = mount();
    const progress = component.element.querySelector('#a11y-demo-progress');
    const button = component.element.querySelector('[data-event="click:stepProgress"]');

    button.click();
    expect(progress.getAttribute('value')).toBe('60');
    button.click();
    button.click();
    expect(progress.getAttribute('value')).toBe('100');
    button.click();
    expect(progress.getAttribute('value')).toBe('0');
    component.destroy();
  });

  it('counts focusable activations', () => {
    const component = mount();
    component.element.querySelector('a11y-focusable').click();
    component.element.querySelector('a11y-focusable').click();
    expect(component.element.querySelector('#a11y-demo-focusable-count').textContent).toBe('2');
    component.destroy();
  });

  it('routes the card links through the SPA router and counts the in-card button separately', () => {
    const navigateSpy = spyOn(Navigation, 'navigateTo').andCallFake(() => {});
    const component = mount();
    try {
      const links = component.element.querySelectorAll('a11y-card-link a[href]');
      expect([...links].map((link) => link.getAttribute('href'))).toEqual(['/a11y-elements/overlays', '/guides/a11y-elements']);
      links[1].click();
      expect(navigateSpy.lastCall[0]).toBe('/guides/a11y-elements');

      component.element.querySelector('[data-event="click:countCardLinkButton"]').click();
      expect(component.element.querySelector('#a11y-demo-card-link-count').textContent).toBe('1');
      expect(navigateSpy.callCount).toBe(1);
    } finally {
      navigateSpy.restore();
    }
    component.destroy();
  });

  it('keeps a valid demo form submit in the page, resets it and reports it', () => {
    const component = mount();
    const form = component.element.querySelector('form');
    const email = form.querySelector('input[type="email"]');
    email.value = 'jane@example.com';
    form.querySelector('input[name="a11y-demo-username"]').value = 'jane';

    const event = new window.Event('submit', { cancelable: true });
    form.dispatchEvent(event);

    expect(event.defaultPrevented).toBe(true);
    expect(email.value).toBe('');
    expect(component.element.querySelector('#a11y-demo-form-status').textContent).not.toBe('');
    component.destroy();
  });

  // minlength never applies to an empty value, so without required an empty
  // username would be valid and submit. jsdom can't check tooShort (it only
  // fires on user edits), so this guards the markup instead.
  it('makes the username required on top of its minlength', () => {
    const component = mount();
    const host = component.element.querySelector('#a11y-demo-username');
    const input = host.querySelector('input');
    expect(input.required).toBe(true);
    expect(input.minLength).toBe(3);
    expect(host.getAttribute('value-missing-message')).toBeTruthy();
    component.destroy();
  });

  it('gives the username field a validator rejecting spaces', () => {
    const component = mount();
    const [noSpaces] = component.element.querySelector('#a11y-demo-username').validators;
    expect(noSpaces('jane doe')).toBeTruthy();
    expect(noSpaces('jane')).toBe(null);
    component.destroy();
  });

  it('routes its back link through the SPA router', () => {
    const navigateSpy = spyOn(Navigation, 'navigateTo').andCallFake(() => {});
    const component = mount();
    try {
      component.element.querySelector('.a11y-demo__back').click();
    } finally {
      navigateSpy.restore();
    }
    expect(navigateSpy.lastCall[0]).toBe('/a11y-elements');
    component.destroy();
  });

  it('rejects usernames containing whitespace', () => {
    const component = mount();
    const [validator] = component.element.querySelector('#a11y-demo-username').validators;
    expect(validator('lois')).toBe(null);
    expect(typeof validator('lois k')).toBe('string');
    component.destroy();
  });

  it('reports user tab changes through the tabs onChange', () => {
    const component = mount();
    const tabs = component.element.querySelector('#a11y-demo-tabs');
    expect(typeof tabs.onChange).toBe('function');
    tabs.onChange('shortcuts');
    expect(component.element.querySelector('#a11y-demo-tabs-status').textContent).toContain('shortcuts');
    component.destroy();
  });

  it('links the first tab panel to an element in a hidden panel', () => {
    const component = mount();
    const link = component.element.querySelector('[data-panel="overview"] a[href^="#"]');
    const target = component.element.querySelector(link.getAttribute('href'));
    expect(target.closest('[data-panel]').getAttribute('data-panel')).toBe('shortcuts');
    component.destroy();
  });

  // The elements aren't upgraded under jsdom: stub the ValueElement methods.
  it('reads every value element, and resets them silently to their initial values', () => {
    const component = mount();
    const ids = ['a11y-demo-toppings', 'a11y-demo-plan', 'a11y-demo-framework', 'a11y-demo-notifications'];
    const set = {};
    for (const id of ids) {
      const element = component.element.querySelector(`#${id}`);
      element.getValue = () => (id in set ? set[id] : `${id}-value`);
      element.setValue = (value) => { set[id] = value; };
    }

    component.element.querySelector('[data-event="click:readValues"]').click();
    const output = component.element.querySelector('#a11y-demo-values-output');
    expect(output.textContent).toContain('a11y-checkbox-group: "a11y-demo-toppings-value"');
    expect(output.textContent.split('\n').length).toBe(4);

    component.element.querySelector('[data-event="click:resetValues"]').click();
    expect(set).toEqual({
      'a11y-demo-toppings': [], 'a11y-demo-plan': 'basic', 'a11y-demo-framework': 'nutin', 'a11y-demo-notifications': true,
    });
    expect(output.textContent).toContain('a11y-switch: true');
    expect(component.element.querySelector('#a11y-demo-values-change').textContent).toBe('');
    component.destroy();
  });

  it('shows the last onChange of any value element', () => {
    const component = mount();
    component.element.querySelector('#a11y-demo-plan').onChange('pro');
    expect(component.element.querySelector('#a11y-demo-values-change').textContent).toBe('a11y-radio-group: "pro"');
    component.destroy();
  });

  it('starts the reset values in sync with the template', () => {
    const component = mount();
    const root = component.element;
    expect(root.querySelector('#a11y-demo-plan input:checked').value).toBe('basic');
    expect(root.querySelector('#a11y-demo-framework select').value).toBe('nutin');
    expect(root.querySelector('#a11y-demo-notifications input').checked).toBe(true);
    expect(root.querySelectorAll('#a11y-demo-toppings input:checked').length).toBe(0);
    component.destroy();
  });
});
