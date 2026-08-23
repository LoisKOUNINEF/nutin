import { Component } from '../../../core/index.js';
import { BaseButton, ButtonManager } from '../utils/index.js';

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

interface BaseButton extends IAttributesConfig {
  callback: () => void;
}

interface ButtonContainerOptions {
  containerClassName?: string;
  containerStyles?: string;
}
*/
export class ButtonComponent extends Component<HTMLButtonElement> {
  private buttonManager: ButtonManager;

  constructor(mountTarget: HTMLElement, button: BaseButton) {
    super({ mountTarget });
    this.buttonManager = new ButtonManager(this, [button], { containerClassName: 'component-buttons' });
  }

  protected override compose(): void {
    this.buttonManager.appendTo(this.element);
    super.compose();
  }
}
