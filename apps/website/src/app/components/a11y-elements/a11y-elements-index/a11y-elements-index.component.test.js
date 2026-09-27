import { A11yElementsIndexComponent } from '#root/dist/src/app/components/a11y-elements/a11y-elements-index/a11y-elements-index.component.js';
import { Navigation } from '#root/dist/src/core/index.js';

function mount() {
  const target = document.createElement('div');
  document.body.appendChild(target);
  const component = new A11yElementsIndexComponent(target);
  component.render();
  return component;
}

describe('A11yElementsIndexComponent', () => {
  let warnSpy;

  beforeAll(() => {
    setupJsdom();
  });

  // The index's SnippetComponents warn that PrismJS isn't loaded under jsdom.
  beforeEach(() => {
    warnSpy = spyOn(console, 'warn');
    warnSpy.andCallFake(() => {});
  });

  afterEach(() => {
    warnSpy.restore();
  });

  it('renders one link card per demo page', () => {
    const component = mount();
    const cards = Array.from(component.element.querySelectorAll('.home-extras .card.pillar-card.card-link'));
    expect(cards.map((card) => card.getAttribute('data-event'))).toEqual([
      'click:navigateTo:elements',
      'click:navigateTo:overlays',
    ]);
    component.destroy();
  });

  it('renders the usage snippets', () => {
    const component = mount();
    expect(component.element.querySelectorAll('.snippet__code').length).toBe(3);
    component.destroy();
  });

  it('routes each card to its demo page', () => {
    const navigateSpy = spyOn(Navigation, 'navigateTo').andCallFake(() => {});
    const component = mount();
    try {
      component.element.querySelectorAll('.card-link').forEach((card) => card.click());
    } finally {
      navigateSpy.restore();
    }
    expect(navigateSpy.calls).toEqual([['/a11y-elements/elements'], ['/a11y-elements/overlays']]);
    component.destroy();
  });
});
