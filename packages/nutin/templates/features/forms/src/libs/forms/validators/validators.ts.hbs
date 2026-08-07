export type ValidatorFn = (value: string) => string | null;

export class Validators {
  static required(value: string): string | null {
    return value.trim().length > 0 ? null : 'validators.required';
  }

  static email(value: string): string | null {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? null : 'validators.email';
  }

  static minLength(min: number): ValidatorFn {
    return (value: string) => value.length >= min ? null : 'validators.minLength';
  }

  static maxLength(max: number): ValidatorFn {
    return (value: string) => value.length <= max ? null : 'validators.maxLength';
  }

  static pattern(regex: RegExp, errorKey = 'validators.pattern'): ValidatorFn {
    return (value: string) => regex.test(value) ? null : errorKey;
  }

  static compose(...fns: ValidatorFn[]): ValidatorFn {
    return (value: string) => {
      for (const fn of fns) {
        const result = fn(value);
        if (result !== null) return result;
      }
      return null;
    };
  }
}
