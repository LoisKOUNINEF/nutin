import { DomHelper } from './helpers/dom.helper.js';
import { EventHelper } from './helpers/event.helper.js';
import { I18nHelper } from './helpers/i18n.helper.js';
import { PipeHelper } from './helpers/pipe.helper.js';
import { ChildrenHelper } from './helpers/children.helper.js';
import { CatalogHelper, CatalogConfig } from './helpers/catalog.helper.js';
import { Component, ComponentOptions, AppEventBus } from '../../index.js';
import { SecurityHelper, TrustLevel } from './helpers/security.helper.js';
export { CatalogItemConfig, CatalogConfig, CatalogItemPrimitive } from './helpers/catalog.helper.js';

/**```typescript
 * export interface ComponentConfig {
 *   selector: string;
 *   factory: (element: HTMLElement) => Component;
 * }
 * ```
 */ 
export interface ComponentConfig {
  selector: string;
  factory: (element: HTMLElement) => Component;
}

export interface BaseComponentOptions {
  template?: string;
  mountTarget?: string | HTMLElement;
  tagName?: keyof HTMLElementTagNameMap;
  trustLevel?: TrustLevel;
}

export abstract class BaseComponent<T extends HTMLElement = HTMLElement> {
  private _children: BaseComponent[] = [];
  private _isRendering = false;
  protected element: T;
  protected eventListeners: Array<[EventTarget, string, EventListener]> = [];
  private _busSubscriptions: Array<[EventKey, (data: any) => void]> = [];
  protected trustLevel: TrustLevel | undefined;

  constructor({
    mountTarget = '#app',
    tagName = 'div',
    trustLevel
  }: BaseComponentOptions) {
    this.trustLevel = trustLevel;
    this.element = DomHelper.createElement<T>(tagName, '', trustLevel);
    DomHelper.mountElement(this.element, mountTarget);
  }

  public childConfigs(): ComponentConfig[] {
    return [];
  }

  public render(): HTMLElement {
    if (this._isRendering) return this.element;
    this._isRendering = true;

    try {
      this.onBeforeRender();
      this.element.innerHTML = SecurityHelper.sanitizeTemplate(
        this.generateTemplate(),
        this.trustLevel
      );
      this.compose();
      this.hydrate();
      this.autoBindEvents()
      this.onAfterRender();
      return this.element;
    } finally {
      this._isRendering = false;
    }
  }

  public destroy(): void {
    this.onBeforeDestroy();
    EventHelper.destroyEvents(this.eventListeners);
    this._busSubscriptions.forEach(([event, callback]) => {
      AppEventBus.off(event, callback);
    });
    this._busSubscriptions = [];
    ChildrenHelper.destroyChildren(this._children);
    this.element.remove();
    this.onAfterDestroy();
  }

  // Lifecycle hooks — override in subclasses as needed
  protected onBeforeRender(): void {}
  protected onAfterRender(): void {}
  protected onBeforeDestroy(): void {}
  protected onAfterDestroy(): void {}

  protected generateTemplate(): string {
    return '';
  }

  protected hydrate(): void {
    this.parseDataAttributes();
    DomHelper.cleanupOptionalContent();
  }

  protected compose(): void {
    this.addChildren();
  }

  protected parseDataAttributes(): void {
    I18nHelper.parseI18nAttributes(this.element);
    PipeHelper.parsePipeAttributes(this.element);
  }

  protected autoBindEvents(): void {
    EventHelper.destroyEvents(this.eventListeners);
    this.eventListeners.length = 0;
    EventHelper.bindEvents(this, this.element, this.eventListeners);
  }

  protected addChildren(): void {
    ChildrenHelper.addChildren(this, this.element, this._children);
  }

  protected catalogConfig(config: CatalogConfig): ComponentConfig[] {
    return CatalogHelper.generateCatalog(config, this.element);
  }

  protected listen<K extends EventKey>(
    event: K,
    callback: (data: EventMap[K]) => void
  ): void {
    AppEventBus.subscribe(event, callback);
    this._busSubscriptions.push([event, callback]);
  }

  protected listenToRenderEvents(events: EventKey[]): void {
    events.forEach((event: EventKey) => {
      this.listen(event, () => this.render());
    });
  }
}
