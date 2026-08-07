import { Component, ComponentProps } from '../../../core/index.js';
import { FormControlHelper } from '../utils/index.js';

export interface IProgressConfig {
  value?: number;
  max?: number;
  labelKey?: string;
  labelText?: string;
  ariaLabel?: string;
}

const normalizeKeys: (keyof IProgressConfig)[] = ['labelKey', 'labelText'];

export class ProgressComponent extends Component<HTMLLabelElement, IProgressConfig> {
  constructor(mountTarget: HTMLElement, config: IProgressConfig = {}, props?: ComponentProps) {
    super({ mountTarget, config, tagName: 'label', normalizeKeys, props });
  }

  protected override onBeforeRender(): void {
    super.onBeforeRender();
    this.element.classList.add('app-progress');
  }

  protected override generateTemplate(): string {
    const { value, max = 100, labelKey, labelText, ariaLabel } = this.config;

    const progressAttrs = [
      'class="progress__bar"',
      value !== undefined ? `value="${value}"` : '',
      `max="${max}"`,
      ariaLabel ? `aria-label="${ariaLabel}"` : '',
    ].filter(Boolean).join(' ');

    return `${FormControlHelper.renderLabel(labelKey, labelText, 'progress__label')}<progress ${progressAttrs}></progress>`;
  }
}
