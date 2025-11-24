import { BaseComponent, ComponentConfig } from "../base-component.js";

export interface CatalogConfig {
  array: CatalogItemConfig[];
  elementName: string;
  elementTag?: keyof HTMLElementTagNameMap;
  selector: string;
  component: new (el: HTMLElement, data: any) => BaseComponent;
};

export interface CatalogItemBase {
  index: number;
}

export type CatalogItemObject<T extends object> = T & CatalogItemBase;

export interface CatalogItemPrimitive extends CatalogItemBase {
  value: string | number | boolean | null | undefined;
}

export type CatalogItemConfig<T = any> =
  T extends object ? CatalogItemObject<T> : CatalogItemPrimitive;

/**
 * ```typescript
interface CatalogConfig {
  array: CatalogItemConfig[];
  elementName: string;
  elementTag?: keyof HTMLElementTagNameMap;
  selector: string;
  component: new (el: HTMLElement, data: any) => BaseComponent;
};

type CatalogItemConfig<T = any> =
  T extends object ? CatalogItemObject<T> : CatalogItemPrimitive;
  ```
*/
export class CatalogHelper {
  public static generateCatalog(config: CatalogConfig): ComponentConfig[] {
    if (!config.array || config.array.length < 1) return [];

    const container = document.querySelector(`[data-catalog="${config.selector}"]`);

    if (!container || !(container instanceof HTMLElement)) return [];

    const componentConfigs: ComponentConfig[] = [];

    for (let i = 0; i < config.array.length; i++) { 
      this.createElements(i, config, container);
      this.pushConfig(i, componentConfigs, config);
    }

    return componentConfigs;
  }

  private static createElements(index: number, config: CatalogConfig, container: HTMLElement): void {
    const el = document.createElement(config.elementTag || 'div');
    el.setAttribute('data-component', `${config.elementName}-${index}`);
    el.dataset.index = String(index);
    container?.appendChild(el);
  }

  private static pushConfig(index: number, componentConfigs: ComponentConfig[], config: CatalogConfig): void {
    const item = config.array[index];

    const configWithIndex: CatalogItemConfig = (item && typeof item === 'object')
      ? { ...(item as object), index: index }
      : { value: item, index: index };
    
    componentConfigs.push(
      { 
        selector: `${config.elementName}-${index}`,
        factory: (el) => new config.component(el, configWithIndex)
      },
    )
  }
}
