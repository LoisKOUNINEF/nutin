import { ButtonManager } from "src/core/index.js";

export interface IPopoverDomElements {
	wrapper: HTMLElement;
	overlay: HTMLElement;
}

export class PopoverDomHelper {
	public static createDomElements(
		content: HTMLElement, 
		buttonManager: ButtonManager
	): IPopoverDomElements {
    const overlay = this.createOverlay();
    const wrapper = this.createWrapper();
    content = this.createContent(content);

    this.appendCloseButton(content);
    this.appendFooterButtons(content, buttonManager);

    wrapper.appendChild(content);
    overlay.appendChild(wrapper);
    document.body.appendChild(overlay);

    return { wrapper, overlay };
  }

  public static removeDomElements(overlay: HTMLElement | null, onRemoved?: () => void): null {
    if (overlay) {
      const wrapper = overlay.querySelector('.popover-wrapper');
      overlay.classList.remove('show');
      wrapper?.classList.remove('show');

      setTimeout(() => {
        wrapper?.remove();
        overlay?.remove();
        onRemoved?.();
      }, 300); // match transition duration
    }
    return null;
  }

  private static createOverlay(): HTMLElement {
    const overlay = document.createElement('div');
    overlay.className = 'popover-overlay';
    return overlay;
  }

  private static createWrapper(): HTMLElement {
    const wrapper = document.createElement('div');
    wrapper.className = 'popover-wrapper';
    return wrapper;
  }

  private static createContent(content: HTMLElement): HTMLElement {
    content.classList.add('popover-content');
    return content;
  }

  private static appendCloseButton(content: HTMLElement): void {
    const closeButton = document.createElement('button');
    closeButton.className = 'popover-close-button';
    closeButton.innerHTML = '&times;';
    closeButton.setAttribute('aria-label', 'Close');
    // bind method onCloseClick
    closeButton.setAttribute('data-event', 'click:onCloseClick');
    content.prepend(closeButton);
  }

  private static appendFooterButtons(
  	content: HTMLElement, 
  	buttonManager: ButtonManager
  ): void {
    buttonManager.appendTo(content);
  }
}