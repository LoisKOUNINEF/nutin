import { MenuOverlayRuntime, MenuOverlayRuntimeOptions } from '../core/menu-overlay-runtime.js';

export interface ContextMenuOptions extends MenuOverlayRuntimeOptions {
  trigger: HTMLElement;
}

export class ContextMenuOverlay extends MenuOverlayRuntime {
  private _trigger: HTMLElement;
  private _boundContextMenu: (e: MouseEvent) => void;

  constructor({ trigger, ...rest }: ContextMenuOptions) {
    super(rest);
    this._trigger = trigger;
    this._boundContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      this.setAnchorPoint(e.clientX, e.clientY);
      this.render();
    };
    trigger.addEventListener('contextmenu', this._boundContextMenu);
  }

  protected override createWrapper(): HTMLElement {
    const el = super.createWrapper();
    el.classList.add('context-menu-wrapper');
    return el;
  }

  protected override getContentClass(): string {
    return 'context-menu-content';
  }

  public dispose(): void {
    this._trigger.removeEventListener('contextmenu', this._boundContextMenu);
    this.close();
  }
}
