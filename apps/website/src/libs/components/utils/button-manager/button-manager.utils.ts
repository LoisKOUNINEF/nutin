import { AttributesHelper, IAttributesConfig } from "../helpers/attributes.helper.js";

export interface BaseButton extends IAttributesConfig {
  callback: () => void;
  ariaExpanded?: boolean;
  ariaControls?: string;
}

export interface ButtonContainerOptions {
  containerClassName?: string;
  containerStyles?: string;
}

/**
 * ```typescript
 interface IAttributesConfig {
  i18nKey?: string;
  textContent?: string;
  className?: string;
  style?: string;
// use regular pipe syntax for arguments / chaining
  pipes?: string;
}

interface ButtonContainerOptions {
  containerClassName?: string;
  containerStyles?: string;
}
  ```
*/
export class ButtonManager {
  private component: any;
  private buttons: BaseButton[];
  private containerOptions: ButtonContainerOptions;

  constructor(
    component: any,
    buttons: BaseButton[] = [],
    containerOptions: ButtonContainerOptions = {}
  ) {
    this.component = component;
    this.buttons = buttons;
    this.containerOptions = {
      containerClassName: 'dynamic-buttons',
      containerStyles: '',
      ...containerOptions
    };
  }

  public createButtonContainer(): HTMLElement | null {
    if (!Array.isArray(this.buttons) || this.buttons.length === 0) {
      return null;
    }

    const container = document.createElement('div');
    container.className = this.containerOptions.containerClassName || 'dynamic-buttons';
    container.style.cssText = this.containerOptions.containerStyles || '';

    this.buttons.forEach((config, index) => {
      const button = this.createButton(config, index);
      container.appendChild(button);
      this.bindButtonCallback(config, index);
    });

    return container;
  }

  public appendTo(target: HTMLElement): void {
    const container = this.createButtonContainer();
    if (container) {
      target.appendChild(container);
    }
  }

  private createButton(config: BaseButton, index: number): HTMLElement {
    const button = document.createElement('button');
    button.setAttribute('type', 'button');

    if (config.ariaExpanded !== undefined) {
      button.setAttribute('aria-expanded', String(config.ariaExpanded));
    }
    if (config.ariaControls) {
      button.setAttribute('aria-controls', config.ariaControls);
    }

    AttributesHelper.setAttributes(button, config);
    this.setDataEvent(button, index);

    return button;
  }

  private setDataEvent(button: HTMLButtonElement, index: number): void {
    button.setAttribute('data-event', `click:onButtonClick_${index}`);
  }

  private bindButtonCallback(config: BaseButton, index: number): void {
    const methodName = `onButtonClick_${index}`;

    this.component[methodName] = () => {
      if (typeof config.callback === 'function') {
        config.callback();
      }
    };
  }

/** Note : doesn't track container
*/
  public updateButtons(newButtons: BaseButton[]): void {
    this.buttons = newButtons;
  }
}
