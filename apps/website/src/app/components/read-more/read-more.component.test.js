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
    const cards = [...component.element.querySelectorAll('a11y-card-link.card-link')];
    const links = cards.map((card) => card.querySelector('.card-title a[href]'));
    try {
      links.forEach((link) => link.click());
    } finally {
      navigateSpy.restore();
    }

    expect(cards.length).toBe(4);
    expect(cards.every((card) => card.hasAttribute('describe') && card.querySelector('[data-card-description]'))).toBe(true);
    expect(navigateSpy.calls.map(([href]) => href)).toEqual(links.map((link) => link.getAttribute('href')));
    expect(navigateSpy.calls[0][0]).toBe('/articles/how-much-frontend-framework-do-you-actually-need');
    component.destroy();
  });
});
