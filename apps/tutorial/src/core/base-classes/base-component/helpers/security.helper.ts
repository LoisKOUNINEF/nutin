export type TrustLevel = 'strict' | 'normal' | 'trusted';

export class SecurityHelper {
  public static sanitizeTemplate(value: unknown, trustLevel: TrustLevel = 'normal'): string {
    if (value === null || value === undefined) return '';
    let template = String(value);

    return this.sanitizeInputTemplate(template, trustLevel);
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

  private static sanitizeInputTemplate(template: string, trustLevel: TrustLevel): string {
    // Trusted: no tamplate sanitization
    if (trustLevel === 'trusted') {
      return template;
    }

    // Always remove scripts and inline event handlers
    template = template
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/\son\w+\s*=\s*["'][^"']*["']/gi, '');
    
    // Strict: remove iframe, object, embed, href, data: protocol
    if (trustLevel === 'strict') {
      template = template
        .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
        .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
        .replace(/<embed\b[^>]*>/gi, '')
        .replace(/href\s*=\s*["']javascript:[^"']*["']/gi, '')
        .replace(/src\s*=\s*["']data:[^"']*["']/gi, '');
    }
    return template;
  }
}
