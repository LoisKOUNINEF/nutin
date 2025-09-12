import { BaseButton, Component } from '../../../../core/index.js';

/** 
 * ```typescript
 * constructor(mountTarget: HTMLElement, button: BaseButton);
 * interface BaseButton {
 *   textContent: string;
 *   callback: () => void;
 *   className?: string;
 * }
 * ```
 * Note : To ensure 'this' is bound properly
 * ```typescript
 // Will handle 'this' inside doStuff
 * { callback: () => this.doStuff() }
 * // Will still work, but won't handle 'this' inside doStuff
 * { callback: this.doStuff }
 * ```
*/
export class ButtonComponent extends Component<HTMLButtonElement> {
  constructor(mountTarget: HTMLElement, button: BaseButton) {
    super({
      mountTarget,
      props: { buttons: [button] }
    });
  }
}
