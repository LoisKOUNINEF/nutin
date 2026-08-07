import { AnchoredOverlayRuntime, AnchoredOverlayRuntimeOptions } from './anchored-overlay-runtime.js';
import { SecurityHelper } from '../../../core/base-classes/base-component/helpers/security.helper.js';

export interface MenuItem {
  label: string;
  value?: string;
  disabled?: boolean;
}

export interface MenuOverlayRuntimeOptions extends AnchoredOverlayRuntimeOptions {
  items: MenuItem[];
  onSelect?: (item: MenuItem, index: number) => void;
}

export abstract class MenuOverlayRuntime extends AnchoredOverlayRuntime {
  private _items: MenuItem[];
  private _onSelectCb?: (item: MenuItem, index: number) => void;
  private _boundMenuKeyDown: ((e: KeyboardEvent) => void) | null = null;
  private _boundFocusOut: ((e: FocusEvent) => void) | null = null;

  constructor({ items, onSelect, trapFocus: _trapFocus, ...rest }: MenuOverlayRuntimeOptions) {
    super({ ...rest, trapFocus: false });
    this._items = items;
    this._onSelectCb = onSelect;
  }

  public override render(): HTMLElement {
    const wrapper = super.render();

    this._initRovingTabindex();
    this._bindMenuKeyboardHandling(wrapper);
    this._focusFirstEnabledItem();

    return wrapper;
  }

  public override destroy(): void {
    this._unbindMenuKeyboardHandling();
    super.destroy();
  }

  protected override createWrapper(): HTMLElement {
    const el = super.createWrapper();
    el.setAttribute('role', 'menu');
    return el;
  }

  protected override generateTemplate(): string {
    return this._items.map((item, index) => {
      const label = SecurityHelper.sanitizeTemplate(item.label);
      const disabledClass = item.disabled ? ' menu-item--disabled' : '';
      const ariaDisabled = item.disabled ? ' aria-disabled="true"' : '';
      const dataEvent = item.disabled ? '' : ` data-event="click:onItemClick:${index}"`;
      return `<div class="menu-item${disabledClass}" role="menuitem" tabindex="-1" data-index="${index}"${ariaDisabled}${dataEvent}>${label}</div>`;
    }).join('');
  }

  protected onItemClick(index: number): void {
    const item = this._items[index];
    if (!item || item.disabled) return;
    this._onSelectCb?.(item, index);
    this.close();
  }

  private _getItemElements(): HTMLElement[] {
    return Array.from(this.element.querySelectorAll<HTMLElement>('.menu-item'));
  }

  private _getEnabledItemElements(): HTMLElement[] {
    return this._getItemElements().filter(el => !el.classList.contains('menu-item--disabled'));
  }

  private _initRovingTabindex(): void {
    const items = this._getItemElements();
    items.forEach((el, i) => el.setAttribute('tabindex', i === 0 ? '0' : '-1'));
  }

  private _focusFirstEnabledItem(): void {
    this._getEnabledItemElements()[0]?.focus();
  }

  private _focusItemAt(items: HTMLElement[], index: number): void {
    items.forEach(el => el.setAttribute('tabindex', '-1'));
    const target = items[index];
    if (!target) return;
    target.setAttribute('tabindex', '0');
    target.focus();
  }

  private _bindMenuKeyboardHandling(wrapper: HTMLElement): void {
    this._boundMenuKeyDown = (e: KeyboardEvent) => {
      const items = this._getEnabledItemElements();
      if (items.length === 0) return;
      const currentIndex = items.indexOf(document.activeElement as HTMLElement);

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          this._focusItemAt(items, (currentIndex + 1) % items.length);
          break;
        case 'ArrowUp':
          e.preventDefault();
          this._focusItemAt(items, (currentIndex - 1 + items.length) % items.length);
          break;
        case 'Home':
          e.preventDefault();
          this._focusItemAt(items, 0);
          break;
        case 'End':
          e.preventDefault();
          this._focusItemAt(items, items.length - 1);
          break;
        case 'Enter':
        case ' ':
          if (currentIndex >= 0) {
            e.preventDefault();
            const index = Number(items[currentIndex]!.dataset.index);
            this.onItemClick(index);
          }
          break;
      }
    };

    this._boundFocusOut = (e: FocusEvent) => {
      const related = e.relatedTarget as Node | null;
      if (related && !wrapper.contains(related)) this.close();
    };

    wrapper.addEventListener('keydown', this._boundMenuKeyDown);
    wrapper.addEventListener('focusout', this._boundFocusOut);
  }

  private _unbindMenuKeyboardHandling(): void {
    if (this._wrapper && this._boundMenuKeyDown) {
      this._wrapper.removeEventListener('keydown', this._boundMenuKeyDown);
    }
    if (this._wrapper && this._boundFocusOut) {
      this._wrapper.removeEventListener('focusout', this._boundFocusOut);
    }
    this._boundMenuKeyDown = null;
    this._boundFocusOut = null;
  }
}
