import { Component, ComponentProps } from '../../../core/index.js';
import { FormControlHelper } from '../../index.js';
import { ValidatorFn } from '../validators/validators.js';

export interface IFormControlConfig {
  name: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search' | 'textarea';
  labelKey?: string;
  labelText?: string;
  placeholder?: string;
  autocomplete?: string;
  required?: boolean;
  disabled?: boolean;
  rows?: number;
  validators?: ValidatorFn[];
  errorMessages?: Record<string, string>;
  onInput?: (value: string) => void;
}

const normalizeKeys: (keyof IFormControlConfig)[] = ['labelKey', 'labelText', 'placeholder', 'autocomplete'];

export class FormControlComponent extends Component<HTMLDivElement, IFormControlConfig> {
  private static _count = 0;
  private readonly _uid = `fctrl-${++FormControlComponent._count}`;
  private _inputEl: HTMLInputElement | HTMLTextAreaElement | null = null;
  private _errorEl: HTMLParagraphElement | null = null;
  private _errors: string[] = [];
  private _touched = false;
  private _valid = true;

  constructor(mountTarget: HTMLElement, config: IFormControlConfig, props?: ComponentProps) {
    super({ mountTarget, config, tagName: 'div', normalizeKeys, props });
  }

  protected override onBeforeRender(): void {
    super.onBeforeRender();
    this.element.classList.add('app-form-control');
    if (this.config.disabled) this.element.classList.add('form-control--disabled');
  }

  protected override generateTemplate(): string {
    const { name, type = 'text', labelKey, labelText, placeholder, autocomplete, required, disabled, rows = 4 } = this.config;
    const uid = this._uid;
    const errorId = `${uid}-error`;

    const labelInner = FormControlHelper.renderLabel(labelKey, labelText, 'form-control__label-text');
    const requiredMark = required ? '<span class="form-control__required" aria-hidden="true">*</span>' : '';

    const attrs = [
      'class="form-control__input"',
      `id="${uid}"`,
      `name="${name}"`,
      `aria-required="${required ? 'true' : 'false'}"`,
      'aria-invalid="false"',
      `aria-describedby="${errorId}"`,
      placeholder  ? `placeholder="${placeholder}"`    : '',
      autocomplete ? `autocomplete="${autocomplete}"`  : '',
      disabled     ? 'disabled'                        : '',
      required     ? 'required'                        : '',
    ].filter(Boolean).join(' ');

    const inputEl = type === 'textarea'
      ? `<textarea ${attrs} rows="${rows}"></textarea>`
      : `<input ${attrs} type="${type}">`;

    return `<label class="form-control__label" for="${uid}">${labelInner}${requiredMark}</label>${inputEl}<p class="form-control__error" id="${errorId}" aria-live="polite" aria-atomic="true"></p>`;
  }

  protected override onAfterRender(): void {
    this._inputEl = this.element.querySelector<HTMLInputElement | HTMLTextAreaElement>('.form-control__input');
    this._errorEl = this.element.querySelector<HTMLParagraphElement>('.form-control__error');
    if (!this._inputEl) return;

    const blurHandler: EventListener = () => this._onBlur();
    const inputHandler: EventListener = () => this._onInput();
    this._inputEl.addEventListener('blur', blurHandler);
    this._inputEl.addEventListener('input', inputHandler);
    this.eventListeners.push(
      [this._inputEl, 'blur', blurHandler],
      [this._inputEl, 'input', inputHandler],
    );
  }

  private _onBlur(): void {
    this._touched = true;
    this._runValidation();
    this._applyErrorState();
  }

  private _onInput(): void {
    if (this.config.onInput && this._inputEl) this.config.onInput(this._inputEl.value);
    if (!this._touched) return;
    this._runValidation();
    this._applyErrorState();
  }

  private _runValidation(): void {
    const value = this._inputEl?.value ?? '';
    this._errors = (this.config.validators ?? [])
      .map(fn => fn(value))
      .filter((e): e is string => e !== null);
  }

  private _applyErrorState(): void {
    this._valid = this._errors.length === 0;
    this._inputEl?.setAttribute('aria-invalid', String(!this._valid));
    if (this._errorEl) {
      this._errorEl.textContent = this._valid ? '' : this._resolveMessage(this._errors[0] ?? '');
    }
    this.element.classList.toggle('form-control--error', !this._valid);
  }

  private _resolveMessage(key: string): string {
    return this.config.errorMessages?.[key] ?? key;
  }

  public getValue(): string {
    return this._inputEl?.value ?? '';
  }

  public validate(): boolean {
    this._runValidation();
    this._applyErrorState();
    return this._valid;
  }

  public get valid(): boolean {
    return this._valid;
  }

  public reset(): void {
    if (this._inputEl) this._inputEl.value = '';
    this._errors = [];
    this._touched = false;
    this._valid = true;
    if (this._errorEl) this._errorEl.textContent = '';
    this._inputEl?.setAttribute('aria-invalid', 'false');
    this.element.classList.remove('form-control--error');
  }

  public markAsTouched(): void {
    this._touched = true;
    this._runValidation();
    this._applyErrorState();
  }
}
