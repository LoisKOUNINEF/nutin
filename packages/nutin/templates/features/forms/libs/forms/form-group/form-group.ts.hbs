export interface IFormField {
  getValue(): string | boolean;
  validate(): boolean;
  get valid(): boolean;
  reset(): void;
  markAsTouched(): void;
  readonly element: HTMLElement;
}

export interface IFormGroupOptions {
  onSubmit?: (values: Record<string, string | boolean>) => void | Promise<void>;
  onValidationFail?: (invalidFields: string[]) => void;
}

export class FormGroup {
  private readonly _fields: Record<string, IFormField>;
  private readonly _options: IFormGroupOptions;
  private readonly _formEl: HTMLFormElement;
  private readonly _submitHandler: EventListener;

  constructor(formEl: HTMLFormElement, fields: Record<string, IFormField>, options: IFormGroupOptions = {}) {
    this._formEl = formEl;
    this._fields = fields;
    this._options = options;

    formEl.setAttribute('novalidate', '');
    this._submitHandler = (e) => { e.preventDefault(); this._handleSubmit(); };
    formEl.addEventListener('submit', this._submitHandler);
  }

  private _handleSubmit(): void {
    const entries = Object.entries(this._fields);
    entries.forEach(([, field]) => {
      field.markAsTouched();
      field.validate();
    });

    if (this.valid) {
      this._options.onSubmit?.(this.getValues());
      return;
    }

    const invalidNames = entries
      .filter(([, field]) => !field.valid)
      .map(([name]) => name);

    this._options.onValidationFail?.(invalidNames);

    const firstInvalidName = invalidNames[0];
    const firstInvalid = firstInvalidName !== undefined ? this._fields[firstInvalidName] : undefined;
    if (firstInvalid) {
      const focusable = firstInvalid.element.querySelector<HTMLElement>(
        '[aria-invalid="true"], input, select, textarea',
      );
      focusable?.focus();
    }
  }

  public getValues(): Record<string, string | boolean> {
    return Object.fromEntries(
      Object.entries(this._fields).map(([name, field]) => [name, field.getValue()]),
    );
  }

  public validate(): boolean {
    Object.values(this._fields).forEach(field => field.validate());
    return this.valid;
  }

  public get valid(): boolean {
    return Object.values(this._fields).every(field => field.valid);
  }

  public reset(): void {
    Object.values(this._fields).forEach(field => field.reset());
  }

  public getField(name: string): IFormField | undefined {
    return this._fields[name];
  }

  public destroy(): void {
    this._formEl.removeEventListener('submit', this._submitHandler);
  }
}
