import { View, AppEventBus } from '../../../index.js';

/**
 * handles all view rendering.
 */
export class ViewRenderManager {
  public static async transitionOutCurrentView(currentView: View | null): Promise<null> {
    if (!currentView) return null;
    currentView.destroy();
    this.emitEvent('view-unmount', currentView.viewName);
    return null;
  }

  public static renderNewView(
    viewConstructor: () => View,
    params: Record<string, string> = {}
  ): View {
    const view = viewConstructor();

    // Set route parameters before rendering
    view.setRouteParams(params);

    view.render();

    this.emitEvent('view-mount', view.viewName);
    return view;
  }

  private static emitEvent(event: EventKey, viewName: string): void {
    AppEventBus.emit(event, viewName);
  }
}
