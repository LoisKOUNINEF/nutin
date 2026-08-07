export class FormControlHelper {
  static renderLabel(labelKey: string | undefined, labelText: string | undefined, className: string): string {
    const key = labelKey ?? '';
    const text = labelText ?? '';
    return `<span class="${className}" data-optional="${key || text}" data-i18n="${key}">${text}</span>`;
  }

  static bindCheckedChange(
    input: HTMLInputElement,
    onChange: ((checked: boolean) => void) | undefined,
    eventListeners: Array<[EventTarget, string, EventListener]>,
  ): void {
    if (typeof onChange !== 'function') return;
    const handler: EventListener = () => onChange(input.checked);
    input.addEventListener('change', handler);
    eventListeners.push([input, 'change', handler]);
  }

  static bindValueChange(
    input: HTMLSelectElement | HTMLInputElement,
    onChange: ((value: string) => void) | undefined,
    eventListeners: Array<[EventTarget, string, EventListener]>,
  ): void {
    if (typeof onChange !== 'function') return;
    const handler: EventListener = () => onChange(input.value);
    input.addEventListener('change', handler);
    eventListeners.push([input, 'change', handler]);
  }
}
