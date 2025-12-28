import { Component, ComponentConfig, ComponentOptions } from "../../index.js";

export interface CatalogConfig extends ComponentOptions {
  array: CatalogItemConfig[];
  elementName: string;
  elementTag?: keyof HTMLElementTagNameMap;
  selector: string;
  component: new (el: HTMLElement, data: any, props?: any) => Component;
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
interface CatalogConfig extends ComponentOptions {
  array: CatalogItemConfig[];
  elementName: string;
  elementTag?: keyof HTMLElementTagNameMap;
  selector: string;
  component: new (el: HTMLElement, data: any) => Component;
};

type CatalogItemConfig<T = any> =
  T extends object ? CatalogItemObject<T> : CatalogItemPrimitive;
  ```
*/
export class CatalogHelper {
  public static generateCatalog(config: CatalogConfig): ComponentConfig[] {
    if (!config.array || config.array.length < 1) return [];

    const componentConfigs: ComponentConfig[] = [];
    const containers = document.querySelectorAll(`[data-catalog="${config.selector}"]`);

    containers.forEach((container) => {
      if (!container || !(container instanceof HTMLElement) || (container.firstElementChild)) return;
      componentConfigs.push(...this.getComponentConfigArray(config, container))
    })

    return componentConfigs;
  }

  private static getComponentConfigArray(config: CatalogConfig, container: HTMLElement): ComponentConfig[] {
    const componentConfigs: ComponentConfig[] = [];
    for (let i = 0; i < config.array.length; i++) {
      this.createElements(i, config, container);
      this.pushConfig(i, componentConfigs, config);
    }
    return componentConfigs;
  }

  private static createElements(index: number, config: CatalogConfig, container: HTMLElement): void {
    const wrapper = document.createElement(config.elementTag || 'div');
    const el = document.createElement('div');
    wrapper.appendChild(el);
    el.setAttribute('data-component', `${config.elementName}-${index}`);
    wrapper.dataset.index = String(index);
    container?.appendChild(wrapper);
  }

  private static pushConfig(index: number, componentConfigs: ComponentConfig[], config: CatalogConfig): void {
    const configWithIndex = this.getConfigWithIndex(config, index)

    const { props, defaults, normalizeKeys } = config;
    const options = { ...props, ...defaults, ...normalizeKeys };

    componentConfigs.push(
      { 
        selector: `${config.elementName}-${index}`,
        factory: (el) => new config.component(el, configWithIndex, options),
      },
    )
  }

  private static getConfigWithIndex(config: CatalogConfig, index: number): CatalogItemConfig {
    const item = config.array[index];
    return (item && typeof item === 'object')
      ? { ...(item as object), index: index }
      : { value: item, index: index };    
  }
}
