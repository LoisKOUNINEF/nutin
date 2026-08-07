import { OverlayRuntime, OverlayRuntimeOptions } from './overlay-runtime.js';

export type PassiveOverlayPosition =
  | 'top' | 'bottom'
  | 'top-left' | 'top-right'
  | 'bottom-left' | 'bottom-right';

export interface PassiveOverlayItem {
  message: string;
  position?: PassiveOverlayPosition;
  duration?: number;
  actionText?: string;
  onAction?: () => void;
}

export abstract class PassiveOverlayRuntime<
  TItem extends PassiveOverlayItem = PassiveOverlayItem
> extends OverlayRuntime {
  protected _queue: TItem[] = [];
  protected _maxStack: number = 1;
  protected _activeCount: number = 0;

  constructor(options: OverlayRuntimeOptions = {}) {
    super(options);
    this.element.setAttribute('aria-live', 'polite');
    this.element.setAttribute('aria-atomic', 'false');
    this.element.setAttribute('aria-relevant', 'additions removals');
    this.element.classList.add('passive-overlay-region');
  }

  public setMaxStack(n: number): void {
    this._maxStack = Math.max(1, n);
  }

  protected enqueue(item: TItem): void {
    if (this._activeCount < this._maxStack) {
      this._activeCount++;
      this._showItem(item);
    } else {
      this._queue.push(item);
    }
  }

  protected _onItemDismissed(): void {
    this._activeCount--;
    if (this._queue.length > 0 && this._activeCount < this._maxStack) {
      const next = this._queue.shift()!;
      this._activeCount++;
      this._showItem(next);
    }
  }

  protected abstract _showItem(item: TItem): void;

  protected _autoDismiss(element: HTMLElement, duration: number, onDone: () => void): void {
    setTimeout(() => {
      element.remove();
      onDone();
    }, duration);
  }
}
