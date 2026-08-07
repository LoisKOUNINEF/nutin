import { Component, ComponentProps } from '../../../core/index.js';

export interface ISpinnerConfig {
  size?:      string;
  color?:     string;
  duration?:  string;
  thickness?: string;
  label?:     string;
}

const templateFn = (_config: ISpinnerConfig) =>
  `<span class="spinner__ring" aria-hidden="true"></span>`;

export class SpinnerComponent extends Component<HTMLElement, ISpinnerConfig> {
  constructor(mountTarget: HTMLElement, config: ISpinnerConfig = {}, props?: ComponentProps) {
    super({ templateFn, mountTarget, config, tagName: 'span', props });
  }

  protected override onBeforeRender(): void {
    super.onBeforeRender();
    this.element.setAttribute('role', 'status');
    this.element.setAttribute('aria-label', this.config.label ?? 'Loading');
    this.element.classList.add('app-spinner');

    const { size, color, duration, thickness } = this.config;
    if (size)      this.element.style.setProperty('--spinner-size', size);
    if (color)     this.element.style.setProperty('--spinner-color', color);
    if (duration)  this.element.style.setProperty('--spinner-duration', duration);
    if (thickness) this.element.style.setProperty('--spinner-thickness', thickness);
  }
}
