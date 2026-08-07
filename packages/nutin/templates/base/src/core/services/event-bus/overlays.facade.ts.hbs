import { AppEventBus, IEventBus } from "./event-bus.js";

class OverlaysFacade {
  constructor(private bus: IEventBus) {}

  modalOpened(): void {
    this.bus.emit('modal-opened');
  }

  onModalOpened(callback: () => void): () => void {
    this.bus.subscribe('modal-opened', callback);
    return () => this.bus.off('modal-opened', callback);
  }

  modalClosed(): void {
    this.bus.emit('modal-closed');
  }

  onModalClosed(callback: () => void): () => void {
    this.bus.subscribe('modal-closed', callback);
    return () => this.bus.off('modal-closed', callback);
  }

  overlayOpened(type: string): void {
    this.bus.emit('overlay-opened', { type });
  }

  onOverlayOpened(callback: (data: { type: string }) => void): () => void {
    this.bus.subscribe('overlay-opened', callback);
    return () => this.bus.off('overlay-opened', callback);
  }

  overlayClosed(type: string): void {
    this.bus.emit('overlay-closed', { type });
  }

  onOverlayClosed(callback: (data: { type: string }) => void): () => void {
    this.bus.subscribe('overlay-closed', callback);
    return () => this.bus.off('overlay-closed', callback);
  }
}

export const Overlays = new OverlaysFacade(AppEventBus);
