export * from './validators/validators.js';
export * from './form-control/form-control.component.js';
export * from './form-group/form-group.js';

import { ValidatorFn } from './validators/validators.js';
import { IFormField } from './form-group/form-group.js';

export function asFormField(
  component: { getValue(): string | boolean; setValue(v: any): void; element: HTMLElement },
  validators: ValidatorFn[] = [],
  options?: { reset?: () => void },
): IFormField {
  let _errors: string[] = [];

  return {
    getValue: () => component.getValue(),
    validate(): boolean {
      _errors = validators
        .map(fn => fn(String(component.getValue())))
        .filter((e): e is string => e !== null);
      return _errors.length === 0;
    },
    get valid() { return _errors.length === 0; },
    reset: () => options?.reset?.() ?? component.setValue(''),
    markAsTouched() { this.validate(); },
    get element() { return component.element; },
  };
}
