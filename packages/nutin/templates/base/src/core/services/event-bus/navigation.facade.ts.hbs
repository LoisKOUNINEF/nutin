import { AppEventBus } from "./event-bus.js";

// Calls AppEventBus directly, so useEventBus() redirects it too. Tests spy on its methods.
class NavigationFacade {
  navigateTo(path: string): void {
    AppEventBus.emit('navigate', { path });
  }

  onNavigate(callback: (data: { path: string }) => void): () => void {
    AppEventBus.subscribe('navigate', callback);
    return () => AppEventBus.off('navigate', callback);
  }

  reload(): void {
    AppEventBus.emit('reload');
  }

  onReload(callback: () => void): () => void {
    AppEventBus.subscribe('reload', callback);
    return () => AppEventBus.off('reload', callback);
  }
}

export const Navigation = /* @__PURE__ */ new NavigationFacade();
