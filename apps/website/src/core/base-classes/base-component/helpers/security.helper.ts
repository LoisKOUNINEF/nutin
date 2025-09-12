export class SecurityHelper {
  public static escapeHtml(value: unknown): string {
    if (value === null || value === undefined) return '';
    const str = String(value);
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  public static sanitizeInputElement(
    el: HTMLInputElement | HTMLTextAreaElement | HTMLElement
  ): string {
    if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) {
      return SecurityHelper.escapeHtml(el.value);
    }
    if (el.hasAttribute('contenteditable')) {
      return SecurityHelper.escapeHtml(el.innerText);
    }
    return '';
  }
}
