import { Component, ComponentProps } from '../../../core/index.js';

export interface ISkeletonConfig {
  variant?: 'rect' | 'circle' | 'text';
  width?: string;
  height?: string;
  lines?: number;
}

export class SkeletonComponent extends Component<HTMLElement, ISkeletonConfig> {
  constructor(mountTarget: HTMLElement, config: ISkeletonConfig = {}, props?: ComponentProps) {
    super({ mountTarget, config, tagName: 'span', props });
  }

  protected override onBeforeRender(): void {
    super.onBeforeRender();
    this.element.setAttribute('aria-hidden', 'true');
    this.element.classList.add('app-skeleton');

    const { variant = 'rect', width, height, lines = 1 } = this.config;
    this.element.classList.add(`skeleton--${variant}`);
    if (width)  this.element.style.setProperty('--skeleton-width', width);
    if (height) this.element.style.setProperty('--skeleton-height', height);
    if (variant === 'text' && lines > 1) {
      this.element.classList.add('skeleton--multiline');
    }
  }

  protected override generateTemplate(): string {
    const { variant = 'rect', lines = 1 } = this.config;
    if (variant === 'text' && lines > 1) {
      return Array.from({ length: lines }, () => '<span class="skeleton__line"></span>').join('');
    }
    return '';
  }
}
