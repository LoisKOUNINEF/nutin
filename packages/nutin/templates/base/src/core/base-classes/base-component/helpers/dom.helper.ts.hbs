import { SecurityHelper, TrustLevel } from "./security.helper.js";

interface DomElementConfig {
  target: Element | null;
  mountTarget: string | HTMLElement; 
  element: HTMLElement
}

export class DomHelper {
  public static mountElement(element: HTMLElement, mountTarget: string | HTMLElement): void {
    const target = typeof mountTarget === 'string' 
      ? document.querySelector(mountTarget) 
      : mountTarget;

    this.appendOrReplace({ target, element, mountTarget });
  }

  public static createElement<T extends HTMLElement>(
    tagName: keyof HTMLElementTagNameMap, 
    template: string = '',
    trustLevel?: TrustLevel
  ): T {
    const element = document.createElement(tagName) as T;
    element.innerHTML = SecurityHelper.sanitizeTemplate(template, trustLevel);
    return element;
  }

  private static appendOrReplace(config: DomElementConfig) {
    if (config.target instanceof HTMLElement) {
      if (typeof config.mountTarget === 'string') {
        // Append mode
        config.target.appendChild(config.element);
      } else {
        // Replace placeholder mode
        config.target.replaceWith(config.element);
      }
    } else {
      console.warn('Mount target not found:', config.mountTarget);
    }
  }
}
