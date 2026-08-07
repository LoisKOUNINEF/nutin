import { Component, ComponentProps } from '../../../core/index.js';
import { FocusableHelper, IFocusableConfig } from '../utils/index.js';

export { FocusableHelper, IFocusableConfig };

const templateFn = (_config: IFocusableConfig) => `<span></span>`;
const normalizeKeys: (keyof IFocusableConfig)[] = ['labelKey', 'href', 'target', 'download'];

export class FocusableComponent extends Component<HTMLElement, IFocusableConfig> {
  constructor(mountTarget: HTMLElement, config: IFocusableConfig, props?: ComponentProps) {
    const { className, ...restProps } = props ?? {};
    super({
      templateFn: config.templateFn ?? templateFn,
      mountTarget,
      config,
      tagName: config.href ? 'a' : 'div',
      normalizeKeys,
      props: restProps,
    });
    if (className) {
      className.split(' ').filter(Boolean).forEach(c => this.element.classList.add(c));
    }
  }

  protected override onBeforeRender(): void {
    super.onBeforeRender();
    FocusableHelper.applySemantics(this.element, this.config);
  }

  protected override onAfterRender(): void {
    FocusableHelper.applyEventListeners(this.element, this.config, this.eventListeners);
  }
}
