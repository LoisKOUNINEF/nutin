import { OverlayRuntime, OverlayRuntimeOptions } from './overlay-runtime.js';
import { FocusTrapHelper, IFocusTrapOptions } from './helpers/focus-trap.helper.js';

export interface ModalOverlayRuntimeOptions extends OverlayRuntimeOptions {
  focusTrapOptions?: IFocusTrapOptions;
  dialogLabel?: string;
  dismissible?: boolean;
}

export abstract class ModalOverlayRuntime extends OverlayRuntime {
  private _focusTrap: FocusTrapHelper | null = null;
  private _focusTrapOptions: IFocusTrapOptions;
  private _boundBackdropClick: ((e: MouseEvent) => void) | null = null;
  private _isDestroying = false;
  private _dismissible: boolean;
  protected _overlay: HTMLElement | null = null;
  protected _wrapper: HTMLElement | null = null;
  protected _dialogLabel: string;

  constructor({ focusTrapOptions = {}, dialogLabel = '', dismissible = true, ...rest }: ModalOverlayRuntimeOptions) {
    super(rest);
    this._dialogLabel = dialogLabel;
    this._dismissible = dismissible;
    this._focusTrapOptions = {
      ...focusTrapOptions,
      onDeactivate: () => this.close(),
    };
  }

  public override render(): HTMLElement {
    this._lockScroll();

    super.render();

    if (this._dismissible) this._appendCloseButton(this.element);
    const { overlay, wrapper } = this._buildModalDom(this.element);
    this._overlay = overlay;
    this._wrapper = wrapper;

    this.autoBindEvents();

    this._autoLabelWrapper(this.element, wrapper);

    if (this._dismissible) {
      this._boundBackdropClick = (e: MouseEvent) => {
        if (e.target === this._overlay) this.close();
      };
      overlay.addEventListener('click', this._boundBackdropClick);
    }

    this._focusTrap = new FocusTrapHelper({
      container: wrapper,
      options: this._focusTrapOptions,
    });
    this._focusTrap.activate();

    this._animateIn(overlay, wrapper);

    return overlay;
  }

  public override destroy(): void {
    if (this._isDestroying) return;
    this._isDestroying = true;

    this._focusTrap?.deactivate();

    if (this._overlay && this._boundBackdropClick) {
      this._overlay.removeEventListener('click', this._boundBackdropClick);
      this._boundBackdropClick = null;
    }

    this._removeDomElements(() => {
      this._unlockScroll();
      this._isDestroying = false;
      super.destroy();
    });
  }

  protected createBackdrop(): HTMLElement {
    const el = document.createElement('div');
    el.className = 'modal-overlay';
    return el;
  }

  protected createWrapper(): HTMLElement {
    const el = document.createElement('div');
    el.className = 'modal-wrapper';
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-modal', 'true');
    return el;
  }

  protected getContentClass(): string {
    return 'modal-content';
  }

  protected onCloseClick(): void {
    this.close();
  }

  private _appendCloseButton(content: HTMLElement): void {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'modal-close-button';
    btn.innerHTML = '&times;';
    btn.setAttribute('aria-label', 'Close dialog');
    btn.setAttribute('data-event', 'click:onCloseClick');
    content.prepend(btn);
  }

  private _buildModalDom(content: HTMLElement): { overlay: HTMLElement; wrapper: HTMLElement } {
    const overlay = this.createBackdrop();
    const wrapper = this.createWrapper();
    content.classList.add(this.getContentClass());
    wrapper.appendChild(content);
    overlay.appendChild(wrapper);
    document.body.appendChild(overlay);
    return { overlay, wrapper };
  }

  private _autoLabelWrapper(content: HTMLElement, wrapper: HTMLElement): void {
    const heading = content.querySelector<HTMLElement>('h1, h2, h3, h4, h5, h6');
    if (heading) {
      const id = this._dialogLabel ? `${this._dialogLabel}-label` : 'modal-label';
      heading.id = id;
      wrapper.setAttribute('aria-labelledby', id);
    } else if (this._dialogLabel) {
      wrapper.setAttribute('aria-labelledby', `${this._dialogLabel}-label`);
    }
  }

  private _animateIn(overlay: HTMLElement, wrapper: HTMLElement): void {
    requestAnimationFrame(() => {
      overlay.classList.add('show');
      wrapper.classList.add('show');
    });
  }

  private _removeDomElements(onRemoved: () => void): void {
    if (!this._overlay || !this._wrapper) {
      onRemoved();
      return;
    }

    const wrapper = this._wrapper;
    const overlay = this._overlay;
    this._wrapper = null;
    this._overlay = null;

    wrapper.classList.remove('show');
    overlay.classList.remove('show');

    wrapper.addEventListener('transitionend', () => {
      wrapper.remove();
      overlay.remove();
      onRemoved();
    }, { once: true });
  }

  private _lockScroll(): void {
    document.documentElement.classList.add('no-scroll');
  }

  private _unlockScroll(): void {
    document.documentElement.classList.remove('no-scroll');
  }
}
