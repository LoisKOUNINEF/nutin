import { View } from '#root/dist/src/core/index.js';

class HomeView extends View {}
class MyFancyView extends View {}
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

  it('derives a kebab-case viewName from the class name, stripping a trailing "View"', () => {
    const view = new HomeView({});
    expect(view.viewName).toBe('home');
  });

  it('derives a kebab-case viewName for a multi-word class name', () => {
    const view = new MyFancyView({});
    expect(view.viewName).toBe('my-fancy');
  });

  it('uses an explicit viewName option instead of deriving one', () => {
    const view = new NamedView({ viewName: 'custom-name' });
    expect(view.viewName).toBe('custom-name');
  });

  it('generateTemplate() returns the constructor template', () => {
    const view = new HomeView({ template: '<p>hi</p>' });
    expect(view.render().innerHTML).toBe('<p>hi</p>');
  });

  it('defaults the template to an empty string', () => {
    const view = new HomeView({});
    expect(view.render().innerHTML).toBe('');
  });

  it('defaults the tagName to "section"', () => {
    const view = new HomeView({});
    expect(view.getElement().tagName).toBe('SECTION');
  });

  it('setRouteParams/getRouteParams/getRouteParam/hasRouteParam manage route params', () => {
    const view = new HomeView({});
    expect(view.hasRouteParam('id')).toBe(false);
    expect(view.getRouteParam('id')).toBeUndefined();

    view.setRouteParams({ id: '42' });

    expect(view.hasRouteParam('id')).toBe(true);
    expect(view.getRouteParam('id')).toBe('42');
    expect(view.getRouteParams()).toEqual({ id: '42' });
  });

  it('getRouteParams() returns a copy, not a live reference', () => {
    const view = new HomeView({});
    view.setRouteParams({ id: '1' });
    const params = view.getRouteParams();
    params.id = 'mutated';
    expect(view.getRouteParam('id')).toBe('1');
  });

  it('onEnter and onExit are present as no-op hooks', () => {
    const view = new HomeView({});
    expect(() => view.onEnter()).not.toThrow();
    expect(() => view.onExit()).not.toThrow();
  });
});
