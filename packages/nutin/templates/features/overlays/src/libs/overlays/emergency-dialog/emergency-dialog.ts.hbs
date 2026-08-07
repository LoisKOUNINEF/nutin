import { ComponentConfig, CatalogConfig, Overlays } from '../../../core/index.js';
import { ModalOverlayRuntime, ModalOverlayRuntimeOptions } from '../core/modal-overlay-runtime.js';

export interface EmergencyDialogOptions extends ModalOverlayRuntimeOptions {
  template: string;
  components?: ComponentConfig[];
  catalogs?: CatalogConfig[];
  onClose?: () => void;
}

export class EmergencyDialogOverlay extends ModalOverlayRuntime {
  private _onCloseCb?: () => void;
  private _components: ComponentConfig[];
  private _catalogs: CatalogConfig[];

  constructor({
    template,
    onClose,
    components = [],
    catalogs = [],
    focusTrapOptions = {},
    ...rest
  }: EmergencyDialogOptions) {
    super({
      ...rest,
      template,
      dismissible: false,
      focusTrapOptions: { ...focusTrapOptions, escapeDeactivates: false },
    });
    this._onCloseCb = onClose;
    this._components = components;
    this._catalogs = catalogs;
  }

  public override childConfigs(): ComponentConfig[] {
    return [
      ...this._components,
      ...this._catalogs.flatMap(c => this.catalogConfig(c)),
    ];
  }

  public override render(): HTMLElement {
    const overlay = super.render();
    Overlays.overlayOpened('emergency-dialog');
    return overlay;
  }

  protected override createBackdrop(): HTMLElement {
    const el = super.createBackdrop();
    el.classList.add('emergency-dialog-overlay');
    return el;
  }

  protected override createWrapper(): HTMLElement {
    const el = super.createWrapper();
    el.classList.add('emergency-dialog-wrapper');
    return el;
  }

  protected override onBeforeDestroy(): void {
    Overlays.overlayClosed('emergency-dialog');
    this._onCloseCb?.();
  }
}
