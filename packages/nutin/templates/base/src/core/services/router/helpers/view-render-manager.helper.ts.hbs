import { View, Lifecycle } from '../../../index.js';

/**
 * handles all view rendering.
 */
export class ViewRenderManager {
  public static async transitionOutCurrentView(currentView: View | null): Promise<null> {
    if (!currentView) return null;
    currentView.destroy();
    currentView.onExit();
    Lifecycle.viewUnmount(currentView.viewName);
    return null;
  }

  public static renderNewView(
    viewConstructor: () => View,
    params: Record<string, string> = {}
  ): View {
    const view = viewConstructor();
    ViewRenderManager.clearStaleMountContent(view);

    // Set route parameters before rendering
    view.setRouteParams(params);

    view.render();
    view.onEnter();

    Lifecycle.viewMount(view.viewName);
    return view;
  }

  private static clearStaleMountContent(view: View): void {
    const viewElement = view.getElement();
    const container = viewElement.parentElement;
    if (!container) return;

    Array.from(container.childNodes).forEach((node) => {
      if (node !== viewElement) node.remove();
    });
  }
}
