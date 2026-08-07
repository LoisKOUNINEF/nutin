import { BaseComponent, BaseComponentOptions } from '../../../core/index.js';

export interface OverlayRuntimeOptions extends Omit<BaseComponentOptions, 'mountTarget'> {
  animationDuration?: number;
}

export abstract class OverlayRuntime extends BaseComponent {
  protected _animationDuration: number;
  private _template: string;

  constructor({ animationDuration, template, ...baseOptions }: OverlayRuntimeOptions = {}) {
    super({ ...baseOptions, mountTarget: 'body' });
    this._animationDuration = animationDuration ?? 300;
    this._template = template ?? '';
  }

  protected override generateTemplate(): string {
    return this._template;
  }

  public open(): HTMLElement {
    return this.render();
  }

  public close(): void {
    this.destroy();
  }
}
