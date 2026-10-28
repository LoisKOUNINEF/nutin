import * as DomHelper from './helpers/dom.helper.js';
import * as EventHelper from './helpers/event.helper.js';
import * as I18nHelper from './helpers/i18n.helper.js';
import * as PipeHelper from './helpers/pipe.helper.js';
import * as ChildrenHelper from './helpers/children.helper.js';
import type { ChildRegistry } from './helpers/children.helper.js';
import * as PreservationHelper from './helpers/preservation.helper.js';
import * as CatalogHelper from './helpers/catalog.helper.js';
import { AppEventBus } from '../../services/event-bus/event-bus.js';
import * as SecurityHelper from './helpers/security.helper.js';

export * as SecurityHelper from './helpers/security.helper.js';
export * as TokenHelper from './helpers/token.helper.js';
export { html, raw, trustedRaw, SafeHtml } from './helpers/html.helper.js';

export abstract class BaseComponent<T extends HTMLElement = HTMLElement> {
  private _children: ChildRegistry = ChildrenHelper.createRegistry();
  private _isRendering = false;
  private _destroyed = false;
  protected element: T;
  protected eventListeners: Array<[EventTarget, string, EventListener]> = [];
  private _busSubscriptions: Array<[Nutin.EventKey, (data: any) => void]> = [];
  protected trustLevel: Nutin.TrustLevel | undefined;

  constructor({
    mountTarget = '#app',
    tagName = 'div',
    trustLevel
  }: Nutin.BaseComponentOptions) {
    this.trustLevel = trustLevel;
    this.element = DomHelper.createElement<T>(tagName, '', trustLevel);
    DomHelper.markComponentRoot(this.element);
    DomHelper.mountElement(this.element, mountTarget);
  }

  public getElement(): T {
    return this.element;
  }

  // A destroyed component can't render or subscribe again: check it before async work
  public get isDestroyed(): boolean {
    return this._destroyed;
  }

  public registerChildren(): Nutin.ComponentConfig[] {
    return [];
  }

  public render(): HTMLElement {
    // A late render (after an await, a timer...) would compose children nothing ever destroys.
    if (this._destroyed) {
      console.warn(`render() called on a destroyed ${this.constructor.name} - ignored. Check isDestroyed after async work.`);
      return this.element;
    }
    if (this._isRendering) return this.element;
    this._isRendering = true;

    try {
      this.onBeforeRender();
      const preserved = PreservationHelper.preserve(ChildrenHelper.getKeepableElements(this._children));
      try {
        this.element.replaceChildren(
          SecurityHelper.sanitizeToFragment(this.templateOrReport(), this.trustLevel)
        );
        this.compose();
      } finally {
        PreservationHelper.restore(preserved);
      }
      this._children.kept.splice(0).forEach(child => child.onKept());
      this.hydrate();
      this.autoBindEvents()
      this.onAfterRender();
      return this.element;
    } finally {
      this._isRendering = false;
    }
  }

  public destroy(): void {
    if (this._destroyed) return;
    this._destroyed = true;
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
  // Called instead of a render when a parent re-render keeps this child as-is
  protected onKept(): void {}

  protected generateTemplate(): Nutin.Template {
    return '';
  }

  private templateOrReport(): Nutin.Template {
    try {
      return this.generateTemplate();
    } catch (error) {
      console.error(`${this.constructor.name}.generateTemplate() threw - its render was aborted.`, error);
      throw error;
    }
  }

  protected hydrate(): void {
    this.parseDataAttributes();
    DomHelper.cleanupOptionalContent(this.element);
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
    EventHelper.bindEvents(this, this.element, this.eventListeners);
  }

  protected addChildren(): void {
    ChildrenHelper.addChildren(this, this.element, this._children);
  }

  protected createCatalogComponents(config: Nutin.CatalogConfig): Nutin.ComponentConfig[] {
    return CatalogHelper.generateCatalog(config, this.element);
  }

  protected listen<K extends Nutin.EventKey>(
    event: K,
    callback: (data: Nutin.EventMap[K]) => void
  ): void {
    if (this._destroyed) {
      console.warn(`listen("${event}") called on a destroyed ${this.constructor.name} - ignored.`);
      return;
    }
    AppEventBus.subscribe(event, callback);
    this._busSubscriptions.push([event, callback]);
  }

  protected listenToRenderEvents(events: Nutin.EventKey[]): void {
    events.forEach((event: Nutin.EventKey) => {
      this.listen(event, () => this.render());
    });
  }
}
