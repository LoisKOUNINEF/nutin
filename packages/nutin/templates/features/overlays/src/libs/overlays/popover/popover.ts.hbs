import { ComponentConfig, CatalogConfig } from '../../../core/index.js';
import { AnchoredOverlayRuntime, AnchoredOverlayRuntimeOptions } from '../core/anchored-overlay-runtime.js';

export interface PopoverOptions extends AnchoredOverlayRuntimeOptions {
  anchor: HTMLElement;
  template: string;
  components?: ComponentConfig[];
  catalogs?: CatalogConfig[];
  interactive?: boolean;
  onClose?: () => void;
}

export class PopoverOverlay extends AnchoredOverlayRuntime {
  private _onCloseCb?: () => void;
  private _components: ComponentConfig[];
  private _catalogs: CatalogConfig[];
  private _interactive: boolean;

  constructor({
    anchor,
    template,
    components = [],
    catalogs = [],
    interactive = false,
    onClose,
    trapFocus,
    ...rest
  }: PopoverOptions) {
    super({ ...rest, template, trapFocus: trapFocus ?? interactive });
    this.setAnchor(anchor);
    this._components = components;
    this._catalogs = catalogs;
    this._interactive = interactive;
    this._onCloseCb = onClose;
  }

  public override childConfigs(): ComponentConfig[] {
    return [
      ...this._components,
      ...this._catalogs.flatMap(c => this.catalogConfig(c)),
    ];
  }

  protected override createWrapper(): HTMLElement {
    const el = super.createWrapper();
    el.classList.add('popover-wrapper');
    el.setAttribute('role', this._interactive ? 'dialog' : 'region');
    return el;
  }

  protected override getContentClass(): string {
    return 'popover-content';
  }

  protected override onBeforeDestroy(): void {
    this._onCloseCb?.();
  }
}
