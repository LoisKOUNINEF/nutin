import * as DomHelper from '../../base-component/helpers/dom.helper.js';
import * as SafeDom from '../../base-component/helpers/safe-dom.helper.js';

// A nested component's data-bind fields belong to that component: they are neither
// filled from this one's props nor returned by its getValues().
export function applyDataBindings(element: HTMLElement, props: Nutin.ComponentProps): void {
  const bindEls = SafeDom.querySelectorAllOf(element, '[data-bind]');
  bindEls.forEach(el => {
    if (DomHelper.isInsideNestedComponent(el, element)) return;
    const key = SafeDom.getAttr(el, 'data-bind');
    if (!key) return;
    
    const value = props[key];
    if (value === undefined) return;

    if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) {
      el.value = String(value);
    } else {
      SafeDom.setText(el, String(value));
    }
  });
}

export function getDataBindingValues(element: HTMLElement): Record<string, string> {
  const values: Record<string, string> = {};
  SafeDom.querySelectorAllOf(element, '[data-bind]').forEach(el => {
    if (DomHelper.isInsideNestedComponent(el, element)) return;
    const key = SafeDom.getAttr(el, 'data-bind');
    if (!key) return;
    
    if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) {
      values[key] = el.value;
    } else {
      values[key] = SafeDom.textOf(el) || '';
    }
  });
  return values;
}
