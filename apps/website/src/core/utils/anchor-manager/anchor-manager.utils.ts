import { AttributesHelper, IAttributesConfig } from "../helpers/attributes.helper.js";

/**
 * ```typescript
interface IAttributesConfig {
  i18nKey?: string;
  textContent?: string;
  className?: string;
  style?: string;
// use regular pipe syntax for arguments / chaining
  pipes?: string;
}
interface IAnchorConfig extends IAttributesConfig {
// prefix href with '#' for internal anchor
  href: string;
  target?: string;
  tagName?: keyof HTMLElementTagNameMap;
}
```
*/
export interface IAnchorConfig extends IAttributesConfig {
  href: string;
  target?: string;
  tagName?: keyof HTMLElementTagNameMap;
}

export class AnchorManager {
  private config: IAnchorConfig;

  constructor(
    config: IAnchorConfig,
    target: HTMLElement
  ) {
    this.config = config;
    this.appendAnchorElement(target);
  }

  private appendAnchorElement(target: HTMLElement): void {
    const container = this.createAnchorContainer();
    target.appendChild(container);
  }

  private createAnchorContainer(): HTMLSpanElement {
    const container = document.createElement('span');
    const anchor = this.createAnchor();
    container.appendChild(anchor);
    return container;
  }

  private createAnchor(): HTMLElement {
    const anchor = document.createElement('a');
    this.setAnchorRef(anchor);
    AttributesHelper.setAttributes(anchor, this.config);
    this.handleClick(anchor);
    return anchor;
  }

  private setAnchorRef(anchor: HTMLAnchorElement): void {
    anchor.setAttribute('href', this.config.href);
    if (this.config.target) {
      anchor.setAttribute('target', this.config.target);
    }
  }

  private handleClick(anchor: HTMLAnchorElement): void {
    const isInternal = this.config.href.startsWith('#');
    if (!isInternal) return;

    const id = this.config.href.slice(1);

    anchor?.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.getElementById(id);
      this.scrollToTarget(target);
      this.accessibilityFeatures(target, id);
    });
  }

  private scrollToTarget(target: HTMLElement | null): void {
    const targetPosition = target?.offsetTop;
    window.scrollTo({
      top: targetPosition,
      behavior: 'smooth'
    })
  }

  private accessibilityFeatures(target: HTMLElement | null, id: string) {
    this.setFocus(target);
    this.setAriaLive(target, id);
  }

  private setFocus(target: HTMLElement | null): void {
    setTimeout(() => {
      target?.setAttribute('tabindex', '-1');
      target?.focus({ preventScroll: true });
      // Remove tabindex after focus
      target?.addEventListener('blur', () => {
        target?.removeAttribute('tabindex');
      }, { once: true });
    }, 100);
  }

  private setAriaLive(target: HTMLElement | null, id: string): void {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.className = 'sr-only';
    announcement.textContent = `Navigated to ${ target?.textContent || id }`;
    document.body.appendChild(announcement);
    setTimeout(() => document.body.removeChild(announcement), 1000);
  }
}