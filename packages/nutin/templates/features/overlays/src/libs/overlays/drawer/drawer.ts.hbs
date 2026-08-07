import { ComponentConfig, CatalogConfig, Overlays } from '../../../core/index.js';
import { ModalOverlayRuntime, ModalOverlayRuntimeOptions } from '../core/modal-overlay-runtime.js';

export type DrawerEdge = 'left' | 'right' | 'top' | 'bottom';

export interface DrawerOptions extends ModalOverlayRuntimeOptions {
  template: string;
  components?: ComponentConfig[];
  catalogs?: CatalogConfig[];
  edge?: DrawerEdge;
  onClose?: () => void;
}

export class DrawerOverlay extends ModalOverlayRuntime {
  private _onCloseCb?: () => void;
  private _components: ComponentConfig[];
  private _catalogs: CatalogConfig[];
  private _edge: DrawerEdge;

  constructor({
    template,
    onClose,
    components = [],
    catalogs = [],
    edge = 'right',
    ...rest
  }: DrawerOptions) {
    super({ ...rest, template });
    this._onCloseCb = onClose;
    this._components = components;
    this._catalogs = catalogs;
    this._edge = edge;
  }

  public override childConfigs(): ComponentConfig[] {
    return [
      ...this._components,
      ...this._catalogs.flatMap(c => this.catalogConfig(c)),
    ];
  }

  public override render(): HTMLElement {
    const overlay = super.render();
    Overlays.overlayOpened('drawer');
    return overlay;
  }

  protected override createBackdrop(): HTMLElement {
    const el = super.createBackdrop();
    el.className = 'drawer-backdrop';
    return el;
  }

  protected override createWrapper(): HTMLElement {
    const el = super.createWrapper();
    el.className = `drawer-wrapper drawer-wrapper--${this._edge}`;
    return el;
  }

  protected override getContentClass(): string {
    return 'drawer-content';
  }

  protected override onBeforeDestroy(): void {
    Overlays.overlayClosed('drawer');
    this._onCloseCb?.();
  }
}
