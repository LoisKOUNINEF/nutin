import { View, ButtonManager, BaseButton, ViewRenderManager } from '../../core/index.js';

export interface PopoverButton extends BaseButton {
  // if needed for Popover-specific properties
}

export interface PopoverOptions {
  template: string;
  viewName?: string;
  onClose?: () => void;
  buttons?: PopoverButton[];
}

export class PopoverView extends View {
  private onClose?: () => void;
  private overlay: HTMLElement | null = null;
  private buttonManager: ButtonManager;

  constructor({
    template,
    buttons = [],
    onClose,
    viewName = 'popover',
  }: PopoverOptions) {
    super({template, tagName: 'div', mountTarget: 'body', viewName});
    this.onClose = onClose;
    this.buttonManager = new ButtonManager(
      this, 
      this.wrapButtonCallbacks(buttons), 
      { containerClassName: 'popover-buttons' }
    );
  }

  public override shouldUpdateMetaContent(): boolean {
    return false;
  }

  public override render(): HTMLElement {
    document.body.classList.add('no-scroll');
    this.overlay = this.createOverlay();

    const wrapper = this.createWrapper();
    const content = this.createContent();

    this.appendCloseButton(content);
    this.appendFooterButtons(content);

    wrapper.appendChild(content);
    this.overlay.appendChild(wrapper);
    document.body.appendChild(this.overlay);

    this.autoBindEvents();
    this.parseDataAttributes();
    this.animateIn(wrapper);

    this.bindOverlayClose();

    return this.overlay;
  }

  public override destroy(): void {
    if (this.overlay) {
      const wrapper = this.overlay.querySelector('.popover-wrapper');
      this.overlay.classList.remove('show');
      wrapper?.classList.remove('show');

      setTimeout(() => {
        wrapper?.remove()
        this.overlay?.remove();
        this.overlay = null;
      }, 250); // match transition duration
    }

    document.body.classList.remove('no-scroll');
    super.destroy();

    if (typeof this.onClose === 'function') {
      this.onClose();
    }
  }

// Wraps button callbacks to include destroy() call
  private wrapButtonCallbacks(buttons: PopoverButton[]): PopoverButton[] {
    return buttons.map(btn => ({
      ...btn,
      callback: () => {
        if (btn.callback) {
          btn.callback();
        }
        this.destroy();
      }
    }));
  }

  private createOverlay(): HTMLElement {
    const overlay = document.createElement('div');
    overlay.className = 'popover-overlay';
    return overlay;
  }

  private createWrapper(): HTMLElement {
    const wrapper = document.createElement('div');
    wrapper.className = 'popover-wrapper';
    return wrapper;
  }

  private createContent(): HTMLElement {
    const content = super.render();
    content.classList.add('popover-content');
    ViewRenderManager.cleanupOptionalContent();
    return content;
  }

  private appendCloseButton(content: HTMLElement): void {
    const closeButton = document.createElement('button');
    closeButton.className = 'popover-close-button';
    closeButton.innerHTML = '&times;';
    closeButton.setAttribute('aria-label', 'Close');
    // bind method onCloseClick
    closeButton.setAttribute('data-event', 'click:onCloseClick');
    content.prepend(closeButton);
  }

  // Handles the close button (via data-event bound in appendCloseButton)
  private onCloseClick(): void {
    this.destroy();
  }

  private appendFooterButtons(content: HTMLElement): void {
    this.buttonManager.appendTo(content);
  }

  private bindOverlayClose(): void {
    this.overlay?.addEventListener('click', (e: MouseEvent) => {
      if (e.target === this.overlay) this.destroy();
    });
  }

  private animateIn(wrapper: HTMLElement): void {
    requestAnimationFrame(() => {
      this.overlay?.classList.add('show');
      wrapper.classList.add('show');
    });
  }
}
