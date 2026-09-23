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
  
  public static cleanupOptionalContent(): void {
    const isEmpty = (el: HTMLElement): boolean => {
      if (el instanceof HTMLImageElement) {
        return !el.src || el.src.trim() === "";
      }

      if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) {
        return !el.value?.trim();
      }

      if (el instanceof HTMLMediaElement || el instanceof HTMLSourceElement) {
        return !el.getAttribute("src");
      }

      const content = el.textContent?.trim();
      return !content || content === "undefined" || content === "null";
    };

    const isValueUndefined = (el: HTMLElement): boolean => {
      const value = el.getAttribute("data-optional");
      /*
      A bare/empty data-optional (getAttribute returns "") is a plain marker and
      defers entirely to isEmpty(el) below rather than forcing removal itself.
      Only a present-but-blank value (whitespace) or the literal string produced
      by interpolating an undefined/null expression counts as "value undefined".
      */
      if (!value) return false;
      return (
        value.trim() === '' ||
        value === "undefined" ||
        value === "null"
      );
    }

    document.querySelectorAll<HTMLElement>("[data-optional]").forEach(el => {
      if (isValueUndefined(el) || isEmpty(el)) el.remove();
      el.removeAttribute("data-optional");
    });
  }

  private static appendOrReplace(config: DomElementConfig) {
    if (config.target instanceof HTMLElement) {
      if (typeof config.mountTarget === 'string') {
        // Append mode
        config.target.appendChild(config.element);
      } else {
        // Replace placeholder mode
        this.copyAttributes(config.target, config.element);
        config.target.replaceWith(config.element);
      }
    } else {
      return;
    }
  }

  // Carries placeholder attributes (class, id, aria-*, data-*...) onto the mounted
  // element. data-component is skipped so an ancestor's child lookup can't re-match it.
  private static copyAttributes(from: HTMLElement, to: HTMLElement): void {
    Array.from(from.attributes).forEach(attr => {
      if (attr.name === 'data-component') return;
      if (attr.name === 'class') {
        to.classList.add(...Array.from(from.classList));
        return;
      }
      to.setAttribute(attr.name, attr.value);
    });
  }
}
