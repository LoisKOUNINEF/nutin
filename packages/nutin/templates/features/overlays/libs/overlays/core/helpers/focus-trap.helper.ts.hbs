type KeyboardEventHandler = (event: KeyboardEvent) => void;

export interface IFocusTrapOptions {
  escapeDeactivates?: boolean;
  returnFocusOnDeactivate?: boolean;
  onDeactivate?: () => void;
}

export interface IFocusTrapHelperParams {
  container: HTMLElement;
  options?: IFocusTrapOptions;
}

export class FocusTrapHelper {
  private _container: HTMLElement;
  private _previousActiveElement: HTMLElement | null = null;
  private _focusableElements: NodeListOf<HTMLElement> | null = null;
  private _firstFocusableElement: HTMLElement | null = null;
  private _lastFocusableElement: HTMLElement | null = null;
  private _boundKeyDown: KeyboardEventHandler;
  private _options: IFocusTrapOptions;
  private _isActive: boolean = false;

  constructor({ container, options = {} }: IFocusTrapHelperParams) {
    this._container = container;
    this._options = {
      escapeDeactivates: options.escapeDeactivates ?? true,
      returnFocusOnDeactivate: options.returnFocusOnDeactivate ?? true,
      onDeactivate: options.onDeactivate,
    };
    this._boundKeyDown = this._handleKeyDown.bind(this);
  }

  private _getFocusableElements(): NodeListOf<HTMLElement> {
    return this._container.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
  }

  public activate(): void {
    if (this._isActive) return;

    this._previousActiveElement = document.activeElement as HTMLElement;
    this._focusableElements = this._getFocusableElements();

    if (this._focusableElements.length > 0) {
      this._firstFocusableElement = this._focusableElements[0] ?? null;
      this._lastFocusableElement = this._focusableElements[this._focusableElements.length - 1] ?? null;
      this._firstFocusableElement?.focus();
    } else {
      this._container.setAttribute('tabindex', '-1');
      this._container.focus();
      this._firstFocusableElement = this._container;
      this._lastFocusableElement = this._container;
    }

    this._container.addEventListener('keydown', this._boundKeyDown);

    const appRoot = document.querySelector<HTMLElement>('#app');
    if (appRoot) appRoot.inert = true;

    this._isActive = true;
  }

  public deactivate(): void {
    if (!this._isActive) return;

    this._container.removeEventListener('keydown', this._boundKeyDown);

    const appRoot = document.querySelector<HTMLElement>('#app');
    if (appRoot) appRoot.inert = false;

    if (this._container.getAttribute('tabindex') === '-1') {
      this._container.removeAttribute('tabindex');
    }

    if (this._options.returnFocusOnDeactivate && this._previousActiveElement?.focus) {
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
      this._firstFocusableElement = this._focusableElements[0] ?? null;
      this._lastFocusableElement = this._focusableElements[this._focusableElements.length - 1] ?? null;
    }
  }

  private _handleKeyDown(event: KeyboardEvent): void {
    switch (event.key) {
      case 'Tab':
        this._handleTabKey(event);
        break;
      case 'Escape':
        if (this._options.escapeDeactivates) {
          event.preventDefault();
          this._options.onDeactivate?.();
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
}
