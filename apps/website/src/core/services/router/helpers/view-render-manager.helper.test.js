import { ViewRenderManager } from '#root/dist/src/core/services/router/helpers/view-render-manager.helper.js';
import { AppEventBus } from '#root/dist/src/core/index.js';

global.requestAnimationFrame = (cb) => setTimeout(cb, 0);

describe('ViewRenderManager', () => {
  let container;

  beforeEach(() => {
    container = document.createElement('div');
    container.id = 'app';
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
    container = null;
  });

  const mockView = (name = 'TestView') => {
    return {
      viewName: name,
      render: () => {
        const el = document.createElement('div');
        el.className = 'mock-view';
        return el;
      },
      destroy: () => {},
      onEnter: () => {},
      onExit: () => {},
    };
  };

  it('should do nothing if no current view is passed to transitionOutCurrentView', async () => {
    const result = await ViewRenderManager.transitionOutCurrentView(null);
    expect(result).toBe(null);
  });

  it('should emit view-unmount event on transition out', async () => {
    const emitted = [];
    const emitSpy = spyOn(AppEventBus, 'emit');
    emitSpy.andCallFake((event, data) => emitted.push({ event, data }));

    const view = mockView('SettingsView');
    const el = view.render();
    container.appendChild(el);

    await ViewRenderManager.transitionOutCurrentView(view);

    expect(JSON.stringify(emitted)).toContain(JSON.stringify({ event: 'view-unmount', data: { viewName: 'SettingsView' } }));
    emitSpy.restore();
  });

  it('should call destroy() and onExit() on the current view when transitioning out', async () => {
    let destroyed = false;
    let exited = false;
    const view = mockView('SettingsView');
    view.destroy = () => { destroyed = true; };
    view.onExit = () => { exited = true; };

    await ViewRenderManager.transitionOutCurrentView(view);

    expect(destroyed).toBe(true);
    expect(exited).toBe(true);
  });

  it('should set route params, render, call onEnter and emit view-mount when rendering a new view', () => {
    const emitted = [];
    const emitSpy = spyOn(AppEventBus, 'emit');
    emitSpy.andCallFake((event, data) => emitted.push({ event, data }));

    const calls = [];
    const viewElement = document.createElement('div');
    const view = {
      viewName: 'HomeView',
      getElement: () => viewElement,
      setRouteParams: (params) => calls.push(['setRouteParams', params]),
      render: () => { calls.push(['render']); return viewElement; },
      onEnter: () => calls.push(['onEnter']),
    };

    ViewRenderManager.renderNewView(() => view, { id: '42' });

    expect(calls).toEqual([
      ['setRouteParams', { id: '42' }],
      ['render'],
      ['onEnter'],
    ]);
    expect(JSON.stringify(emitted)).toContain(JSON.stringify({ event: 'view-mount', data: { viewName: 'HomeView' } }));
    emitSpy.restore();
  });

  it('should not attempt to clear stale content when the new view has no parent element yet', () => {
    const viewElement = document.createElement('div');
    // Note: viewElement is intentionally never attached to the container.
    const view = {
      viewName: 'HomeView',
      getElement: () => viewElement,
      setRouteParams: () => {},
      render: () => viewElement,
      onEnter: () => {},
    };

    expect(() => ViewRenderManager.renderNewView(() => view)).not.toThrow();
  });

  it('should clear stale mount content before rendering the new view', () => {
    const stale = document.createElement('div');
    stale.className = 'stale-seo-content';
    container.appendChild(stale);

    const viewElement = document.createElement('div');
    viewElement.className = 'mock-view';
    container.appendChild(viewElement);

    const view = {
      viewName: 'HomeView',
      getElement: () => viewElement,
      setRouteParams: () => {},
      render: () => viewElement,
      onEnter: () => {},
    };

    ViewRenderManager.renderNewView(() => view);

    expect(container.children.length).toBe(1);
    expect(container.contains(stale)).toBe(false);
    expect(container.contains(viewElement)).toBe(true);
  });
});
