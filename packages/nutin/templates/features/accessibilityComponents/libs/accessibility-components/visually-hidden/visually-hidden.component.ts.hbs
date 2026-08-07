import { Component, ComponentProps } from '../../../core/index.js';

export interface IVisuallyHiddenConfig {
  textContent?: string;
  i18nKey?: string;
  pipes?: string;
}

export class VisuallyHiddenComponent extends Component<HTMLSpanElement, IVisuallyHiddenConfig> {
  constructor(mountTarget: HTMLElement, config: IVisuallyHiddenConfig, props?: ComponentProps) {
    super({ mountTarget, config, tagName: 'span', props });
  }

  protected override onBeforeRender(): void {
    super.onBeforeRender();
    this.element.classList.add('visually-hidden');
  }

  protected override generateTemplate(): string {
    const { i18nKey, textContent, pipes } = this.config;
    const i18nAttr = i18nKey ? ` data-i18n="${i18nKey}"` : '';
    const pipeAttr = pipes  ? ` data-pipe="${pipes}"`   : '';
    return `<span${i18nAttr}${pipeAttr}>${textContent || ''}</span>`;
  }
}
