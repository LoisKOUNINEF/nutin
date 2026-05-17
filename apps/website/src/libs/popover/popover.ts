import { View, ButtonManager, BaseButton, ComponentConfig, AppPipeRegistry, CatalogConfig, AppEventBus } from '../../core/index.js';
import { FocusTrapHelper, IFocusTrapOptions } from './helpers/focus-trap.helper.js';
import { IPopoverDomElements, PopoverDomHelper } from './helpers/popover-dom.helper.js';

export interface PopoverButton extends BaseButton {
  // if needed for Popover-specific properties
}

export interface PopoverOptions {
  template: string;
  components?: ComponentConfig[];
  catalogs?: CatalogConfig[];
  viewName?: string;
  onClose?: () => void;
  buttons?: PopoverButton[];
  focusTrapOptions?: IFocusTrapOptions;
}

export class PopoverView extends View {
  private _onClose?: () => void;
  private _overlay: HTMLElement | null = null;
  private _buttonManager: ButtonManager;
  private _prevTitle: string | undefined;
  private _catalogs: CatalogConfig[];
  private _focusTrap: FocusTrapHelper | null = null;
  private _focusTrapOptions: IFocusTrapOptions;
  private _components: ComponentConfig[];

  constructor({
    template,
    buttons = [],
    onClose,
    viewName,
    components = [],
    catalogs = [],
    focusTrapOptions = {}
  }: PopoverOptions) {
    super({ template, tagName: 'div', mountTarget: 'body' });
    this._onClose = onClose;
    this._components = components;
    this._catalogs = catalogs;
    this._buttonManager = this.createButtonManager(buttons);
    this.setOptionalViewName(viewName);
    this._focusTrapOptions = focusTrapOptions;
    AppEventBus.subscribe('popover-close', () => this.destroy());
  }

  public childConfigs(): ComponentConfig[] {
    return [
      ...this._components,
      ...this.catalogConfigs()
    ];
  }

  public catalogConfigs(): ComponentConfig[] {
    const configs: ComponentConfig[] = []
    this._catalogs.map((catalog) => {
      configs.push(...this.catalogConfig(catalog));
    })
    return configs;
  }

  public override shouldUpdateMetaContent(): boolean {
    return false;
  }

  public override render(): HTMLElement {
    document.documentElement.classList.add('no-scroll');

    const { wrapper, overlay } = this.createPopoverDomElements();

    this._focusTrap = this.createFocusTrap(wrapper, overlay);
    this._focusTrap.activate();

    AppEventBus.emit('popover-opened');
    this._overlay = overlay;
    return overlay;
  }

  public override destroy(): void {
    this._focusTrap?.deactivate();
    if (this._prevTitle) document.title = this._prevTitle;

    this._overlay = PopoverDomHelper.removeDomElements(this._overlay, () => {
      document.documentElement.classList.remove('no-scroll');
      super.destroy();
      if (typeof this._onClose === 'function') {
        this._onClose();
      }
    });
  }

  private setOptionalViewName(viewName: string | undefined): void {
    if (viewName) {
      this._prevTitle = document.title;
      document.title = AppPipeRegistry.apply('capitalize', viewName);
    }
  }

  private createButtonManager(buttons: PopoverButton[]): ButtonManager {
    return new ButtonManager(
      this, 
      buttons, 
      { containerClassName: 'popover-buttons' }
    );
  }

  private createPopoverDomElements(): IPopoverDomElements {
    const content = super.render();
    const { overlay, wrapper } = PopoverDomHelper.createDomElements(content, this._buttonManager);

    this.autoBindEvents();
    this.parseDataAttributes();
    this.animateIn(wrapper);

    return { overlay, wrapper };
  }

  private createFocusTrap(wrapper: HTMLElement, overlay: HTMLElement): FocusTrapHelper {
    return new FocusTrapHelper({
      container: wrapper,
      overlay: overlay,
      options: this._focusTrapOptions
    });
  }

  // Handles the close button (via data-event bound in appendCloseButton)
  private onCloseClick(): void {
    this.destroy();
  }

  private animateIn(wrapper: HTMLElement): void {
    requestAnimationFrame(() => {
      this._overlay?.classList.add('show');
      wrapper.classList.add('show');
    });
  }
}