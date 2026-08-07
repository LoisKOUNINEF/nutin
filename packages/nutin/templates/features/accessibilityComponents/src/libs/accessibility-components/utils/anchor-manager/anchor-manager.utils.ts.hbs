import { AttributesHelper, IAttributesConfig } from "../helpers/attributes.helper.js";
import { LinkHelper } from "../helpers/link.helper.js";

/**
 * ```typescript
interface IAttributesConfig {
  i18nKey?: string;
  textContent?: string;
  className?: string;
  style?: string;
// use regular pipe syntax for arguments / chaining
  pipes?: string;
  ariaLabel?: string;
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
    const anchor = this.createAnchor();
    target.appendChild(anchor);
  }

  private createAnchor(): HTMLAnchorElement {
    const anchor = document.createElement('a');
    this.setAnchorRef(anchor);
    AttributesHelper.setAttributes(anchor, this.config);
    if (this.config.target) {
      this.addNewTabAriaLabel(anchor);
    }
    this.handleClick(anchor);
    return anchor;
  }

  private setAnchorRef(anchor: HTMLAnchorElement): void {
    anchor.setAttribute('href', this.config.href);
    if (this.config.target) {
      LinkHelper.applyExternalTarget(anchor, this.config.target);
    }
  }

  private addNewTabAriaLabel(anchor: HTMLAnchorElement): void {
    const baseLabel = anchor.getAttribute('aria-label')
      || anchor.textContent
      || this.config.href;
    anchor.setAttribute('aria-label', LinkHelper.appendNewTabSuffix(baseLabel));
  }

  private handleClick(anchor: HTMLAnchorElement): void {
    const isInternal = this.config.href.startsWith('#');
    if (!isInternal) return;

    const id = this.config.href.slice(1);

    const activate = (e: Event) => {
      e.preventDefault();
      const target = document.getElementById(id);
      this.scrollToTarget(target);
      this.accessibilityFeatures(target, id);
    };

    anchor.addEventListener('click', activate);
    const spaceHandler = LinkHelper.makeInternalAnchorSpaceHandler(this.config.href, activate);
    if (spaceHandler) anchor.addEventListener('keydown', spaceHandler);
  }

  private scrollToTarget(target: HTMLElement | null): void {
    target?.scrollIntoView({ behavior: 'smooth' });
  }

  private accessibilityFeatures(target: HTMLElement | null, id: string) {
    this.setFocus(target);
    this.setAriaLive(target, id);
  }

  private setFocus(target: HTMLElement | null): void {
    setTimeout(() => {
      target?.setAttribute('tabindex', '-1');
      target?.focus({ preventScroll: true });
      target?.addEventListener('blur', () => {
        target?.removeAttribute('tabindex');
      }, { once: true });
    }, 100);
  }

  private setAriaLive(target: HTMLElement | null, id: string): void {
    const announcement = document.createElement('div');
    announcement.setAttribute('role', 'status');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'u-sr-only';
    document.body.appendChild(announcement);
    // Delay content so AT registers the live region before it receives text.
    // announcement.remove() is safe even if navigation already detached the element.
    setTimeout(() => {
      announcement.textContent = `Navigated to ${ target?.textContent || id }`;
      setTimeout(() => announcement.remove(), 3000);
    }, 100);
  }
}
