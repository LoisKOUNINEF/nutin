import { ComponentProps } from "../component.js";

export class DataBindingHelper {
  public static applyDataBindings(element: HTMLElement, props: ComponentProps): void {
    const bindEls = element.querySelectorAll('[data-bind]');
    bindEls.forEach(el => {
      const key = el.getAttribute('data-bind');
      if (!key) return;
      
      const value = props[key];
      if (value === undefined) return;

      if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) {
        el.value = String(value);
      } else {
        el.textContent = String(value);
      }
    });
  }

  public static getDataBindingValues(element: HTMLElement): Record<string, string> {
    const values: Record<string, string> = {};
    element.querySelectorAll('[data-bind]').forEach(el => {
      const key = el.getAttribute('data-bind');
      if (!key) return;
      
      if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) {
        values[key] = el.value;
      } else {
        values[key] = el.textContent || '';
      }
    });
    return values;
  }
}
