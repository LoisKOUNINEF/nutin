import { I18nService } from '../../../index.js';

export class I18nHelper {
  public static parseI18nAttributes(element: HTMLElement): void {
    element.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n')!;
      const params = JSON.parse(el.getAttribute('data-i18n-params') || '{}');
      this.setTranslatedContent(el, key, params);
    });
  }

  private static setTranslatedContent(
    el: Element, 
    key: string, 
    params: Record<string, string> = {}
  ): void {
    if (el instanceof HTMLInputElement) {
      el.placeholder = I18nService.translate(key, params);
    } else {
      el.textContent = I18nService.translate(key, params);
    }
  }
}
