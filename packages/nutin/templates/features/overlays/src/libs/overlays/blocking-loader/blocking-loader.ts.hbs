import { ComponentConfig, Overlays } from '../../../core/index.js';
import { SecurityHelper } from '../../../core/base-classes/base-component/helpers/security.helper.js';
import { SpinnerComponent } from '../../components/spinner/spinner.component.js';
import { OverlayRuntime, OverlayRuntimeOptions } from '../core/overlay-runtime.js';

export interface BlockingLoaderOptions extends Omit<OverlayRuntimeOptions, 'template'> {
  message?: string;
}

export class BlockingLoaderOverlay extends OverlayRuntime {
  private _message?: string;

  constructor({ message, ...rest }: BlockingLoaderOptions = {}) {
    super({ ...rest, template: '' });
    this._message = message;

    this.element.classList.add('blocking-loader-overlay');
    this.element.setAttribute('role', 'alert');
    this.element.setAttribute('aria-busy', 'true');
    this.element.setAttribute('aria-live', 'assertive');
  }

  public override childConfigs(): ComponentConfig[] {
    return [{
      selector: 'blocking-loader-spinner',
      factory: (el) => new SpinnerComponent(el, { size: '3rem', label: this._message ?? 'Loading' }),
    }];
  }

  protected override generateTemplate(): string {
    const message = SecurityHelper.sanitizeTemplate(this._message);
    return `
      <div data-component="blocking-loader-spinner"></div>
      <p class="blocking-loader-overlay__message" data-optional>${message}</p>
    `;
  }

  public override render(): HTMLElement {
    document.documentElement.classList.add('no-scroll');
    const el = super.render();
    Overlays.overlayOpened('blocking-loader');
    return el;
  }

  public override destroy(): void {
    document.documentElement.classList.remove('no-scroll');
    Overlays.overlayClosed('blocking-loader');
    super.destroy();
  }
}
