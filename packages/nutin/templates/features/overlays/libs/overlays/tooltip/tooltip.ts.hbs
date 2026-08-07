import { AnchoredOverlayRuntime, AnchoredOverlayRuntimeOptions } from '../core/anchored-overlay-runtime.js';

export interface TooltipOptions extends Omit<AnchoredOverlayRuntimeOptions, 'trapFocus' | 'focusTrapOptions'> {
  anchor: HTMLElement;
  template: string;
  showDelay?: number;
  hideDelay?: number;
}

export class TooltipOverlay extends AnchoredOverlayRuntime {
  private _anchorEl: HTMLElement;
  private _showDelay: number;
  private _hideDelay: number;
  private _showTimer: ReturnType<typeof setTimeout> | null = null;
  private _hideTimer: ReturnType<typeof setTimeout> | null = null;
  private _boundShow: () => void;
  private _boundHide: () => void;

  constructor({ anchor, template, showDelay = 300, hideDelay = 100, ...rest }: TooltipOptions) {
    super({ ...rest, template, trapFocus: false });
    this.setAnchor(anchor);
    this._anchorEl = anchor;
    this._showDelay = showDelay;
    this._hideDelay = hideDelay;

    this._boundShow = () => this._scheduleShow();
    this._boundHide = () => this._scheduleHide();

    anchor.addEventListener('mouseenter', this._boundShow);
    anchor.addEventListener('focus', this._boundShow);
    anchor.addEventListener('mouseleave', this._boundHide);
    anchor.addEventListener('blur', this._boundHide);
  }

  protected override createWrapper(): HTMLElement {
    const el = super.createWrapper();
    el.classList.add('tooltip-wrapper');
    el.setAttribute('role', 'tooltip');
    return el;
  }

  protected override getContentClass(): string {
    return 'tooltip-content';
  }

  public dispose(): void {
    this._clearTimers();
    this._anchorEl.removeEventListener('mouseenter', this._boundShow);
    this._anchorEl.removeEventListener('focus', this._boundShow);
    this._anchorEl.removeEventListener('mouseleave', this._boundHide);
    this._anchorEl.removeEventListener('blur', this._boundHide);
    this.close();
  }

  private _scheduleShow(): void {
    this._clearTimers();
    this._showTimer = setTimeout(() => this.render(), this._showDelay);
  }

  private _scheduleHide(): void {
    this._clearTimers();
    this._hideTimer = setTimeout(() => this.close(), this._hideDelay);
  }

  private _clearTimers(): void {
    if (this._showTimer) {
      clearTimeout(this._showTimer);
      this._showTimer = null;
    }
    if (this._hideTimer) {
      clearTimeout(this._hideTimer);
      this._hideTimer = null;
    }
  }
}
