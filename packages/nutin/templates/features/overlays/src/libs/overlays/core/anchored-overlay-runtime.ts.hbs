import { OverlayRuntime, OverlayRuntimeOptions } from './overlay-runtime.js';
import { FocusTrapHelper, IFocusTrapOptions } from './helpers/focus-trap.helper.js';

export type AnchoredSide = 'top' | 'bottom' | 'left' | 'right';
export type AnchoredAlign = 'start' | 'end';
export type AnchoredPlacement = AnchoredSide | `${AnchoredSide}-${AnchoredAlign}`;

export interface AnchoredOverlayRuntimeOptions extends OverlayRuntimeOptions {
  placement?: AnchoredPlacement;
  offset?: number;
  trapFocus?: boolean;
  focusTrapOptions?: IFocusTrapOptions;
}

export abstract class AnchoredOverlayRuntime extends OverlayRuntime {
  protected _anchor: HTMLElement | null = null;
  protected _anchorRect: DOMRect | null = null;
  protected _wrapper: HTMLElement | null = null;
  protected _placement: AnchoredPlacement;
  protected _offset: number;

  private _trapFocus: boolean;
  private _focusTrapOptions: IFocusTrapOptions;
  private _focusTrap: FocusTrapHelper | null = null;
  private _boundOutsideClick: ((e: MouseEvent) => void) | null = null;
  private _outsideClickTimer: ReturnType<typeof setTimeout> | null = null;
  private _boundKeyDown: ((e: KeyboardEvent) => void) | null = null;
  private _boundReposition: (() => void) | null = null;
  private _resizeObserver: ResizeObserver | null = null;
  private _isDestroying = false;

  constructor({
    placement = 'bottom',
    offset = 8,
    trapFocus = false,
    focusTrapOptions = {},
    ...rest
  }: AnchoredOverlayRuntimeOptions = {}) {
    super(rest);
    this._placement = placement;
    this._offset = offset;
    this._trapFocus = trapFocus;
    this._focusTrapOptions = {
      ...focusTrapOptions,
      onDeactivate: () => this.close(),
    };
  }

  public override render(): HTMLElement {
    if (this._wrapper) this._removeWrapperSync();

    super.render();

    const wrapper = this._buildWrapper(this.element);
    this._wrapper = wrapper;

    this.updatePosition();
    this._bindDismissListeners(wrapper);
    this._bindRepositionListeners(wrapper);

    if (this._trapFocus) {
      this._focusTrap = new FocusTrapHelper({
        container: wrapper,
        options: this._focusTrapOptions,
      });
      this._focusTrap.activate();
    }

    this._animateIn(wrapper);

    return wrapper;
  }

  public override destroy(): void {
    if (this._isDestroying) return;
    this._isDestroying = true;

    this._focusTrap?.deactivate();
    this._focusTrap = null;

    this._unbindDismissListeners();
    this._unbindRepositionListeners();

    this._removeWrapper(() => {
      this._isDestroying = false;
      super.destroy();
    });
  }

  protected setAnchor(el: HTMLElement): void {
    this._anchor = el;
    this._anchorRect = null;
  }

  protected setAnchorPoint(x: number, y: number): void {
    this._anchor = null;
    this._anchorRect = new DOMRect(x, y, 0, 0);
  }

  protected createWrapper(): HTMLElement {
    const el = document.createElement('div');
    el.className = 'anchored-overlay-wrapper';
    return el;
  }

  protected getContentClass(): string {
    return 'anchored-overlay-content';
  }

  protected updatePosition(): void {
    const anchorRect = this._getAnchorRect();
    if (!anchorRect || !this._wrapper) return;

    const wrapperRect = this._wrapper.getBoundingClientRect();
    const viewportWidth = document.documentElement.clientWidth;
    const viewportHeight = document.documentElement.clientHeight;

    const { placement, top, left } = this._computePosition(
      anchorRect,
      wrapperRect,
      viewportWidth,
      viewportHeight
    );

    this._wrapper.setAttribute('data-placement', placement);
    this._wrapper.style.top = `${top}px`;
    this._wrapper.style.left = `${left}px`;
  }

  private _getAnchorRect(): DOMRect | null {
    if (this._anchor) return this._anchor.getBoundingClientRect();
    return this._anchorRect;
  }

  private _computePosition(
    anchorRect: DOMRect,
    wrapperRect: DOMRect,
    viewportWidth: number,
    viewportHeight: number
  ): { placement: string; top: number; left: number } {
    const [side, align] = this._placement.split('-') as [AnchoredSide, AnchoredAlign | undefined];

    const opposite: Record<AnchoredSide, AnchoredSide> = {
      top: 'bottom',
      bottom: 'top',
      left: 'right',
      right: 'left',
    };

    const fits = (s: AnchoredSide): boolean => {
      switch (s) {
        case 'top': return anchorRect.top - this._offset - wrapperRect.height >= 0;
        case 'bottom': return anchorRect.bottom + this._offset + wrapperRect.height <= viewportHeight;
        case 'left': return anchorRect.left - this._offset - wrapperRect.width >= 0;
        case 'right': return anchorRect.right + this._offset + wrapperRect.width <= viewportWidth;
      }
    };

    const resolvedSide = !fits(side) && fits(opposite[side]) ? opposite[side] : side;

    let top: number;
    let left: number;

    if (resolvedSide === 'top' || resolvedSide === 'bottom') {
      top = resolvedSide === 'top'
        ? anchorRect.top - this._offset - wrapperRect.height
        : anchorRect.bottom + this._offset;
      left = this._alignCrossAxis(align, anchorRect.left, anchorRect.right, wrapperRect.width);
      left = this._clamp(left, this._offset, viewportWidth - wrapperRect.width - this._offset);
    } else {
      left = resolvedSide === 'left'
        ? anchorRect.left - this._offset - wrapperRect.width
        : anchorRect.right + this._offset;
      top = this._alignCrossAxis(align, anchorRect.top, anchorRect.bottom, wrapperRect.height);
      top = this._clamp(top, this._offset, viewportHeight - wrapperRect.height - this._offset);
    }

    const placement = align ? `${resolvedSide}-${align}` : resolvedSide;
    return { placement, top, left };
  }

  private _alignCrossAxis(
    align: AnchoredAlign | undefined,
    anchorStart: number,
    anchorEnd: number,
    wrapperSize: number
  ): number {
    if (align === 'start') return anchorStart;
    if (align === 'end') return anchorEnd - wrapperSize;
    return anchorStart + (anchorEnd - anchorStart) / 2 - wrapperSize / 2;
  }

  private _clamp(value: number, min: number, max: number): number {
    if (max < min) return min;
    return Math.min(Math.max(value, min), max);
  }

  private _buildWrapper(content: HTMLElement): HTMLElement {
    const wrapper = this.createWrapper();
    content.classList.add(this.getContentClass());
    wrapper.appendChild(content);
    document.body.appendChild(wrapper);
    return wrapper;
  }

  private _bindDismissListeners(wrapper: HTMLElement): void {
    this._boundOutsideClick = (e: MouseEvent) => {
      const target = e.target as Node;
      if (wrapper.contains(target) || this._anchor?.contains(target)) return;
      this.close();
    };
    this._outsideClickTimer = setTimeout(() => {
      document.addEventListener('click', this._boundOutsideClick!);
    }, 0);

    if (!this._trapFocus) {
      this._boundKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') this.close();
      };
      document.addEventListener('keydown', this._boundKeyDown);
    }
  }

  private _unbindDismissListeners(): void {
    if (this._outsideClickTimer) {
      clearTimeout(this._outsideClickTimer);
      this._outsideClickTimer = null;
    }
    if (this._boundOutsideClick) {
      document.removeEventListener('click', this._boundOutsideClick);
      this._boundOutsideClick = null;
    }
    if (this._boundKeyDown) {
      document.removeEventListener('keydown', this._boundKeyDown);
      this._boundKeyDown = null;
    }
  }

  private _bindRepositionListeners(wrapper: HTMLElement): void {
    this._boundReposition = () => this.updatePosition();
    window.addEventListener('scroll', this._boundReposition, true);
    window.addEventListener('resize', this._boundReposition);

    if (typeof ResizeObserver !== 'undefined') {
      this._resizeObserver = new ResizeObserver(this._boundReposition);
      if (this._anchor) this._resizeObserver.observe(this._anchor);
      this._resizeObserver.observe(wrapper);
    }
  }

  private _unbindRepositionListeners(): void {
    if (this._boundReposition) {
      window.removeEventListener('scroll', this._boundReposition, true);
      window.removeEventListener('resize', this._boundReposition);
      this._boundReposition = null;
    }
    this._resizeObserver?.disconnect();
    this._resizeObserver = null;
  }

  private _animateIn(wrapper: HTMLElement): void {
    requestAnimationFrame(() => wrapper.classList.add('show'));
  }

  private _removeWrapperSync(): void {
    this._wrapper?.remove();
    this._wrapper = null;
  }

  private _removeWrapper(onRemoved: () => void): void {
    if (!this._wrapper) {
      onRemoved();
      return;
    }

    const wrapper = this._wrapper;
    this._wrapper = null;

    wrapper.classList.remove('show');
    wrapper.addEventListener('transitionend', () => {
      wrapper.remove();
      onRemoved();
    }, { once: true });
  }
}
