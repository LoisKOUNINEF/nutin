import { ReadMoreComponent } from '#root/dist/src/app/components/read-more/read-more.component.js';
import { Navigation } from '#root/dist/src/core/index.js';

describe('ReadMoreComponent', () => {
  beforeAll(() => {
    setupJsdom();
  });

  it('routes each article card to its /articles/<slug> page', () => {
    const target = document.createElement('div');
    document.body.appendChild(target);
    const component = new ReadMoreComponent(target);
    component.render();

    const navigateSpy = spyOn(Navigation, 'navigateTo').andCallFake(() => {});
    const cards = [...component.element.querySelectorAll('.card-link')];
    try {
      cards.forEach((card) => card.click());
    } finally {
      navigateSpy.restore();
    }

    expect(cards.length).toBe(4);
    expect(navigateSpy.calls.map(([href]) => href)).toEqual(
      cards.map((card) => `/articles/${card.getAttribute('data-event').split(':')[2]}`)
    );
    expect(navigateSpy.calls[0][0]).toBe('/articles/how-much-frontend-framework-do-you-actually-need');
    component.destroy();
  });
});
