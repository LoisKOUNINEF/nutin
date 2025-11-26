import { DomHelper } from './helpers/dom.helper.js';
import { EventHelper } from './helpers/event.helper.js';
import { I18nHelper } from './helpers/i18n.helper.js';
import { PipeHelper } from './helpers/pipe.helper.js';
import { ChildrenHelper } from './helpers/children.helper.js';
import { CatalogHelper, CatalogConfig } from './helpers/catalog.helper.js';
import { TrustLevel } from './helpers/security.helper.js';
export { CatalogItemConfig } from './helpers/catalog.helper.js';

/**```typescript
 * export interface ComponentConfig {
 *   selector: string;
 *   factory: (element: HTMLElement) => BaseComponent;
 * }
 * ```
 */ 
export interface ComponentConfig {
  selector: string;
  factory: (element: HTMLElement) => BaseComponent;
}

export interface BaseComponentOptions {
  template?: string;
  mountTarget?: string | HTMLElement;
  tagName?: keyof HTMLElementTagNameMap;
  trustLevel?: TrustLevel;
}

export abstract class BaseComponent<T extends HTMLElement = HTMLElement> {
  private _children: BaseComponent[] = [];
  protected element: T;
  protected eventListeners: Array<[string, EventListener]> = [];

  constructor({
    template = '',
    mountTarget = '#app',
    tagName = 'div',
    trustLevel
  }: BaseComponentOptions) {
    this.element = DomHelper.createElement<T>(tagName, template, trustLevel);
    this.parseDataAttributes();
    this.autoBindEvents();
    DomHelper.mountElement(this.element, mountTarget);
  }

  public childConfigs(): ComponentConfig[] {
    return [];
  }

  public destroy(): void {
    EventHelper.destroyEvents(this.element, this.eventListeners);
    ChildrenHelper.destroyChildren(this._children);
    this.element.remove();
  }

  public render(): HTMLElement {
    this.addChildren();
    return this.element;
  }

/**
 * ```typescript
interface CatalogConfig {
  array: CatalogItemConfig[];
  elementName: string;
  elementTag?: keyof HTMLElementTagNameMap;
  selector: string;
  component: new (el: HTMLElement, data: any) => BaseComponent;
};
  ```
*/
  protected catalogConfig(config: CatalogConfig): ComponentConfig[] {
    return CatalogHelper.generateCatalog(config);
  }

  protected parseDataAttributes(): void {
    I18nHelper.parseI18nAttributes(this.element);
    PipeHelper.parsePipeAttributes(this.element);
  }

  protected autoBindEvents(): void {
    EventHelper.bindEvents(this, this.element, this.eventListeners);
  }

  protected addChildren(): void {
    ChildrenHelper.addChildren(this, this.element, this._children);
  }
}
