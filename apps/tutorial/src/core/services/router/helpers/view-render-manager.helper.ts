import { View, AppEventBus } from '../../../index.js';

/**
 * handles all view rendering.
 */
export class ViewRenderManager {
  static async transitionOutCurrentView(currentView: View | null): Promise<null> {
    if (!currentView) return null;
    currentView.destroy();
    this.emitEvent('view-unmount', currentView.viewName);
    return null;
  }

  static renderNewView(
    viewConstructor: () => View,
    params: Record<string, string> = {}
  ): View {
    const view = viewConstructor();

    // Set route parameters before rendering
    view.setRouteParams(params);

    view.render();
    
    this.cleanupOptionalContent();

    this.emitEvent('view-mount', view.viewName);
    return view;
  }

  static cleanupOptionalContent() {
    const isEmpty = (content: string | undefined | null): boolean => {
      if (!content?.trim() || content === 'undefined') return true;
      return false;
    };

    document.querySelectorAll<HTMLElement>('[data-optional]').forEach(el => {
      const content = el.textContent?.trim();
          
      if (isEmpty(content)) {
        el.remove();
      }
    });
  }

  static emitEvent(event: EventKey, viewName: string): void {
    AppEventBus.emit(event, viewName);
  }
}
