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
      target?.scrollIntoView({ behavior: 'smooth' });
    });
  }
}