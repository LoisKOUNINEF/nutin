import { I18nService } from '../../../index.js';

export class I18nHelper {
  public static parseI18nAttributes(element: HTMLElement): void {
    element.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n')!;
      this.setTranslatedContent(el, key);
    });
  }

  private static setTranslatedContent(
    el: Element, 
    key: string
  ): void {
    if (el instanceof HTMLInputElement) {
      el.placeholder = I18nService.translate(key, el.textContent);
    } else {
      el.textContent = I18nService.translate(key, el.textContent);
    }
  }
}
