import { DomHelper } from '../../base-component/helpers/dom.helper.js';

// A nested component's data-bind fields belong to that component: they are neither
// filled from this one's props nor returned by its getValues().
export class DataBindingHelper {
  public static applyDataBindings(element: HTMLElement, props: ComponentProps): void {
    const bindEls = element.querySelectorAll('[data-bind]');
    bindEls.forEach(el => {
      if (DomHelper.isInsideNestedComponent(el, element)) return;
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
      if (DomHelper.isInsideNestedComponent(el, element)) return;
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
