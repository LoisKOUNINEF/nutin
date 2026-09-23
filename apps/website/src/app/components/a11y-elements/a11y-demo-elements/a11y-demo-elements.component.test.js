import { A11yDemoElementsComponent } from '#root/dist/src/app/components/a11y-elements/a11y-demo-elements/a11y-demo-elements.component.js';

const ELEMENTS = [
  'a11y-anchor', 'a11y-avatar', 'a11y-checkbox', 'a11y-focusable', 'a11y-picture', 'a11y-progress',
  'a11y-radio-group', 'a11y-select', 'a11y-skeleton', 'a11y-spinner', 'a11y-switch', 'a11y-visually-hidden',
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
});
