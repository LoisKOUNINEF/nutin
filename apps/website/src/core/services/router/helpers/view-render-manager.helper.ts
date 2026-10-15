import type { View } from '../../../base-classes/view/view.js';
import { Lifecycle } from '../../event-bus/lifecycle.facade.js';

/**
 * handles all view rendering.
 */
export async function transitionOutCurrentView(currentView: View | null): Promise<null> {
  if (!currentView) return null;
  currentView.destroy();
  currentView.onExit();
  Lifecycle.viewUnmount(currentView.viewName);
  return null;
}

// Takes the view already created by its route's factory: a lazy route's is only
// available once its chunk has loaded.
export function renderNewView(
  view: View,
  params: Record<string, string> = {}
): View {
  clearStaleMountContent(view);

  // Set route parameters before rendering
  view.setRouteParams(params);

  view.render();
  view.onEnter();

  Lifecycle.viewMount(view.viewName);
  return view;
}

function clearStaleMountContent(view: View): void {
  const viewElement = view.getElement();
  const container = viewElement.parentElement;
  if (!container) return;

  Array.from(container.childNodes).forEach((node) => {
    if (node !== viewElement) node.remove();
  });
}
