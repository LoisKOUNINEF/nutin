import { AppEventBus, IEventBus } from "./event-bus.js";

class NavigationFacade {
  constructor(private bus: IEventBus) {}

  navigateTo(path: string): void {
    this.bus.emit('navigate', { path });
  }

  onNavigate(callback: (data: { path: string }) => void): () => void {
    this.bus.subscribe('navigate', callback);
    return () => this.bus.off('navigate', callback);
  }

  reload(): void {
    this.bus.emit('reload');
  }

  onReload(callback: () => void): () => void {
    this.bus.subscribe('reload', callback);
    return () => this.bus.off('reload', callback);
  }
}

export const Navigation = new NavigationFacade(AppEventBus);
