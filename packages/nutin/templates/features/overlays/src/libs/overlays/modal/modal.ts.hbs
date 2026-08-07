import { ComponentConfig, CatalogConfig, AppPipeRegistry, Overlays } from '../../../core/index.js';
import { ModalOverlayRuntime, ModalOverlayRuntimeOptions } from '../core/modal-overlay-runtime.js';

export interface ModalOptions extends ModalOverlayRuntimeOptions {
  template: string;
  components?: ComponentConfig[];
  catalogs?: CatalogConfig[];
  viewName?: string;
  fullscreen?: boolean;
  onClose?: () => void;
}

export class ModalOverlay extends ModalOverlayRuntime {
  private _onCloseCb?: () => void;
  private _components: ComponentConfig[];
  private _catalogs: CatalogConfig[];
  private _prevTitle: string | undefined;
  private _fullscreen: boolean;

  constructor({
    template,
    onClose,
    viewName,
    components = [],
    catalogs = [],
    fullscreen = false,
    focusTrapOptions = {},
    ...rest
  }: ModalOptions) {
    super({ ...rest, template, focusTrapOptions, dialogLabel: viewName ?? '' });
    this._onCloseCb = onClose;
    this._components = components;
    this._catalogs = catalogs;
    this._fullscreen = fullscreen;
    this._setViewName(viewName);
  }

  public override childConfigs(): ComponentConfig[] {
    return [
      ...this._components,
      ...this._catalogs.flatMap(c => this.catalogConfig(c)),
    ];
  }

  public override render(): HTMLElement {
    const overlay = super.render();
    Overlays.modalOpened();
    Overlays.overlayOpened('modal');
    return overlay;
  }

  protected override createBackdrop(): HTMLElement {
    const el = super.createBackdrop();
    el.className = 'modal-overlay';
    return el;
  }

  protected override createWrapper(): HTMLElement {
    const el = super.createWrapper();
    el.className = 'modal-wrapper';
    if (this._fullscreen) el.classList.add('modal-wrapper--fullscreen');
    return el;
  }

  protected override getContentClass(): string {
    return 'modal-content';
  }

  protected override onAfterRender(): void {
  }

  protected override onBeforeDestroy(): void {
    Overlays.modalClosed();
    Overlays.overlayClosed('modal');
    if (this._prevTitle !== undefined) document.title = this._prevTitle;
    this._onCloseCb?.();
  }

  private _setViewName(viewName: string | undefined): void {
    if (viewName) {
      this._prevTitle = document.title;
      document.title = AppPipeRegistry.apply('capitalize', viewName);
    }
  }
}

export { ModalOverlay as ModalView };
