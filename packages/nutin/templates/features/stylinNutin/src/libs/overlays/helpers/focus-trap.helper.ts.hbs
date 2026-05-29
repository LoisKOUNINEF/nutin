import { AppEventBus } from "../../../core/index.js";

type KeyboardEventHandler = (event: KeyboardEvent) => void;

export interface IFocusTrapOptions {
  escapeDeactivates?: boolean;
  clickOutsideDeactivates?: boolean;
  returnFocusOnDeactivate?: boolean;
}

export interface IFocusTrapHelperParams {
  container: HTMLElement;
  overlay: HTMLElement;
  options?: IFocusTrapOptions;
}

export class FocusTrapHelper {
  private _container: HTMLElement;
  private _overlay: HTMLElement;
  private _previousActiveElement: HTMLElement | null | undefined = null;
  private _focusableElements: NodeListOf<HTMLElement> | null | undefined = null;
  private _firstFocusableElement: HTMLElement | null | undefined = null;
  private _lastFocusableElement: HTMLElement | null | undefined = null;
  private _boundKeyDown: KeyboardEventHandler;
  private _options: IFocusTrapOptions;
  private _isActive: boolean = false;

  constructor({container, overlay, options = {}}: IFocusTrapHelperParams) {
    this._container = container;
    this._overlay = overlay;
    this._options = {
      escapeDeactivates: true,
      clickOutsideDeactivates: true,
      returnFocusOnDeactivate: true,
      ...options
    };
    this._boundKeyDown = this._handleKeyDown.bind(this);
  }

  private _getFocusableElements(): NodeListOf<HTMLElement> {
    return this._container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    ) as NodeListOf<HTMLElement>;
  }

  public activate(): void {
    if (this._isActive) return;
    
    this._previousActiveElement = document.activeElement as HTMLElement;
    
    this._focusableElements = this._getFocusableElements();
    
    if (this._focusableElements.length > 0) {
      this._firstFocusableElement = this._focusableElements[0];
      this._lastFocusableElement = this._focusableElements[this._focusableElements.length - 1];
      
      this._firstFocusableElement?.focus();
    } else {
      this._container.setAttribute('tabindex', '-1');
      this._container.focus();
      this._firstFocusableElement = this._container;
      this._lastFocusableElement = this._container;
    }
    
    this._container.addEventListener('keydown', this._boundKeyDown);
    
      document.addEventListener('click', this._handleOutsideClick.bind(this));
    
    this._disableOutsideTabIndex();
    
    this._isActive = true;
  }

  public deactivate(): void {
    if (!this._isActive) return;
    
    this._container.removeEventListener('keydown', this._boundKeyDown);
    document.removeEventListener('click', this._handleOutsideClick.bind(this));
    
    this._enableOutsideTabIndex();
    
    if (this._container.getAttribute('tabindex') === '-1') {
      this._container.removeAttribute('tabindex');
    }
    
    if (this._options.returnFocusOnDeactivate && 
      this._previousActiveElement && 
      this._previousActiveElement.focus
    ) {
      this._previousActiveElement.focus();
    }
    
    this._focusableElements = null;
    this._firstFocusableElement = null;
    this._lastFocusableElement = null;
    this._previousActiveElement = null;
    
    this._isActive = false;
  }

  public getIsActive(): boolean {
    return this._isActive;
  }

  public updateFocusableElements(): void {
    if (!this._isActive) return;
    
    this._focusableElements = this._getFocusableElements();
    
    if (this._focusableElements.length > 0) {
      this._firstFocusableElement = this._focusableElements[0];
      this._lastFocusableElement = this._focusableElements[this._focusableElements.length - 1];
    }
  }

  private _disableOutsideTabIndex(): void {
    const allElements = document.querySelectorAll('body *') as NodeListOf<HTMLElement>;
    
    allElements.forEach((el: HTMLElement) => {
      if (!this._container.contains(el)) {
        const currentTabIndex = el.getAttribute('tabindex');
        if (currentTabIndex !== '-1') {
          const originalTabIndex = currentTabIndex || 
            (el.tabIndex !== -1 ? el.tabIndex.toString() : null);
          
          if (originalTabIndex !== null) {
            el.setAttribute('data-original-tabindex', originalTabIndex);
          }
          
          el.setAttribute('tabindex', '-1');
        }
      }
    });
  }

  private _enableOutsideTabIndex(): void {
    const allElements = document.querySelectorAll(
      '[data-original-tabindex]'
    ) as NodeListOf<HTMLElement>;
    
    allElements.forEach((el: HTMLElement) => {
      const originalTabIndex = el.getAttribute('data-original-tabindex');
      
      if (originalTabIndex === null) {
        el.removeAttribute('tabindex');
      } else if (originalTabIndex === '0') {
        el.removeAttribute('tabindex');
      } else {
        el.setAttribute('tabindex', originalTabIndex);
      }
      
      el.removeAttribute('data-original-tabindex');
    });
  }

  private _handleKeyDown(event: KeyboardEvent): void {
    switch (event.key) {
      case 'Tab':
        this._handleTabKey(event);
        break;
      case 'Escape':
        if (this._options.escapeDeactivates) {
          event.preventDefault();
          AppEventBus.emit('popover-close');
          this.deactivate();
        }
        break;
    }
  }

  private _handleTabKey(event: KeyboardEvent): void {
    if (!this._focusableElements || this._focusableElements.length === 0) return;
    
    if (event.shiftKey) {
      if (document.activeElement === this._firstFocusableElement) {
        event.preventDefault();
        this._lastFocusableElement?.focus();
      }
    } else {
      if (document.activeElement === this._lastFocusableElement) {
        event.preventDefault();
        this._firstFocusableElement?.focus();
      }
    }
  }

  private _handleOutsideClick(event: MouseEvent): void {
    if (!this._options.clickOutsideDeactivates) return;
    this._overlay.addEventListener('click', (e: MouseEvent) => {
      if (e.target === this._overlay){ 
        event.stopPropagation();
        AppEventBus.emit('popover-close');
        this.deactivate();;
      }
    });
  }
}
