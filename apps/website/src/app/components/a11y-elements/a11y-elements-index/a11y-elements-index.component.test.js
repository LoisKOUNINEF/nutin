import { A11yElementsIndexComponent } from '#root/dist/src/app/components/a11y-elements/a11y-elements-index/a11y-elements-index.component.js';

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
});
