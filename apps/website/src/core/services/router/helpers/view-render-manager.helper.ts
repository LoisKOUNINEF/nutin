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


    this.cleanupOptionalContent();

    this.emitEvent('view-mount', view.viewName);
    return view;
  }

  public static cleanupOptionalContent(): void {
    const isEmpty = (el: HTMLElement): boolean => {
      const attrName = el.dataset.optional?.trim();

      if (attrName && attrName !== "") {
        const attrValue = el.getAttribute(attrName);
        return !attrValue || attrValue.trim() === "" || attrValue === "undefined";
      }

      if (el instanceof HTMLImageElement) {
        return !el.src || el.src.trim() === "";
      }

      if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) {
        return !el.value?.trim();
      }

      if (el instanceof HTMLMediaElement || el instanceof HTMLSourceElement) {
        return !el.getAttribute("src");
      }

      const content = el.textContent?.trim();
      return !content || content === "undefined";
    };

    document.querySelectorAll<HTMLElement>("[data-optional]").forEach(el => {
      if (isEmpty(el)) el.remove();
    });
  }

  private static emitEvent(event: EventKey, viewName: string): void {
    AppEventBus.emit(event, viewName);
  }
}
