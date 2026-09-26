import { A11yDemoElementsComponent } from '#root/dist/src/app/components/a11y-elements/a11y-demo-elements/a11y-demo-elements.component.js';

const ELEMENTS = [
  'a11y-anchor', 'a11y-avatar', 'a11y-checkbox', 'a11y-focusable', 'a11y-input', 'a11y-label', 'a11y-picture',
  'a11y-progress', 'a11y-radio-group', 'a11y-select', 'a11y-skeleton', 'a11y-spinner', 'a11y-switch',
  'a11y-textarea', 'a11y-visually-hidden',
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
    expect(component.element.querySelectorAll('.a11y-demo__section').length).toBe(ELEMENTS.length);
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
});
