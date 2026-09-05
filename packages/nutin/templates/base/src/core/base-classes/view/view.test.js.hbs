import { View } from '#root/dist/src/core/index.js';

class HomeView extends View {}
class NamedView extends View {}

describe('View', () => {
  let app;

  beforeEach(() => {
    app = document.getElementById('app');
  });

  afterEach(() => {
    app.innerHTML = '';
    app = null;
  });

  it('throws when viewName is omitted', () => {
    expect(() => new HomeView({})).toThrow();
  });

  it('throws when viewName is an empty string', () => {
    expect(() => new HomeView({ viewName: '' })).toThrow();
  });

  it('uses the explicit viewName option', () => {
    const view = new NamedView({ viewName: 'custom-name' });
    expect(view.viewName).toBe('custom-name');
  });

  it('generateTemplate() returns the constructor template', () => {
    const view = new HomeView({ viewName: 'home', template: '<p>hi</p>' });
    expect(view.render().innerHTML).toBe('<p>hi</p>');
  });

  it('defaults the template to an empty string', () => {
    const view = new HomeView({ viewName: 'home' });
    expect(view.render().innerHTML).toBe('');
  });

  it('defaults the tagName to "section"', () => {
    const view = new HomeView({ viewName: 'home' });
    expect(view.getElement().tagName).toBe('SECTION');
  });

  it('setRouteParams/getRouteParams/getRouteParam/hasRouteParam manage route params', () => {
    const view = new HomeView({ viewName: 'home' });
    expect(view.hasRouteParam('id')).toBe(false);
    expect(view.getRouteParam('id')).toBeUndefined();

    view.setRouteParams({ id: '42' });

    expect(view.hasRouteParam('id')).toBe(true);
    expect(view.getRouteParam('id')).toBe('42');
    expect(view.getRouteParams()).toEqual({ id: '42' });
  });

  it('getRouteParams() returns a copy, not a live reference', () => {
    const view = new HomeView({ viewName: 'home' });
    view.setRouteParams({ id: '1' });
    const params = view.getRouteParams();
    params.id = 'mutated';
    expect(view.getRouteParam('id')).toBe('1');
  });

  it('onEnter and onExit are present as no-op hooks', () => {
    const view = new HomeView({ viewName: 'home' });
    expect(() => view.onEnter()).not.toThrow();
    expect(() => view.onExit()).not.toThrow();
  });
});
