import type { KeepableComponentConfig } from './children.helper.js';
import type { BaseComponent } from '../base-component.js';
import type { Component } from '../../component/component.js';
import * as SafeDom from './safe-dom.helper.js';
import * as DomHelper from './dom.helper.js';

export function generateCatalog(config: Nutin.CatalogConfig, scope: Element = document.documentElement): Nutin.ComponentConfig[] {
  const items = config.items;
  // A Set, a Map or a generator has no .length, so it renders nothing; a string renders one item per character.
  if (!globalThis.__NUTIN_PROD__ && items != null && (typeof items === 'string' || typeof items.length !== 'number')) {
    console.warn(`createCatalogComponents() expects an array of items, got ${Object.prototype.toString.call(items)} - use Array.from(set) or [...map.values()].`);
  }
  // !(length > 0) also covers a value without a length: like an empty array, it leaves the containers as they are.
  if (!items || !(items.length > 0)) return [];

  const componentConfigs: Nutin.ComponentConfig[] = [];
  const containers = SafeDom.querySelectorAllOf(scope, `[data-catalog="${config.selector}"]`);

  containers.forEach((container) => {
    if (!container || !(container instanceof HTMLElement)) return;
    componentConfigs.push(...getComponentConfigItems(config, items, container))
  })

  return componentConfigs;
}

function getComponentConfigItems(config: Nutin.CatalogConfig, items: readonly unknown[], container: HTMLElement): Nutin.ComponentConfig[] {
  // SafeDom: a container that is a <form> may hold a control named innerHTML/appendChild.
  SafeDom.assign(container, 'innerHTML', '');
  const componentConfigs: Nutin.ComponentConfig[] = [];
  for (let i = 0; i < items.length; i++) {
    createElements(i, config, container);
    pushConfig(i, items[i], componentConfigs, config);
  }
  return componentConfigs;
}

function createElements(index: number, config: Nutin.CatalogConfig, container: HTMLElement): void {
  const wrapper = SafeDom.createElementIn(document, config.elementTag || 'div');
  const el = SafeDom.createElementIn(document, 'div');
  wrapper.appendChild(el);
  el.setAttribute('data-component', `${config.elementName}-${index}`);
  wrapper.dataset.index = String(index);
  if (container) SafeDom.invoke(container, 'appendChild', wrapper);
}

function pushConfig(index: number, item: unknown, componentConfigs: Nutin.ComponentConfig[], config: Nutin.CatalogConfig): void {
  const configWithIndex = getConfigWithIndex(item, index)

  const { props, defaults } = config;
  const options = { ...props, ...defaults };

  const componentConfig: KeepableComponentConfig = {
    selector: `${config.elementName}-${index}`,
    factory: (el) => new config.component(el, configWithIndex, options),
  };

  if (config.keepBy) {
    componentConfig.keep = config.keepBy(item, index);
    componentConfig.scope = `catalog:${config.selector}:${config.elementName}`;
    componentConfig.keepIf = { item, options, component: config.component };
  }

  componentConfigs.push(componentConfig);
}

function getConfigWithIndex(item: unknown, index: number): Nutin.CatalogItemConfig {
  return (item && typeof item === 'object')
    ? { ...(item as object), index: index }
    : { value: item as Nutin.CatalogItemPrimitive['value'], index: index };
}

// The instances of the catalog items in parent's [data-catalog="selector"] containers, in DOM order:
// with one container, result[i] is items[i]; several containers come one after the other.
// Read from the DOM on each call, so don't keep the result across renders.
// SafeDom: a <form> container or wrapper may hold a control named children/firstElementChild.
export function getCatalogComponents<C extends BaseComponent = Component>(parent: BaseComponent, selector: string): C[] {
  const root = parent.getElement();
  const components: C[] = [];
  SafeDom.querySelectorAllOf(root, `[data-catalog="${selector}"]`).forEach(container => {
    if (DomHelper.isInsideNestedComponent(container, root)) return;
    Array.from(SafeDom.prop<HTMLCollection>(container, 'children')).forEach(wrapper => {
      const itemRoot = SafeDom.prop<Element | null>(wrapper, 'firstElementChild');
      // Skips what isn't an item: an empty catalog's leftover template content, an unmounted placeholder.
      const component = itemRoot && DomHelper.getComponentOf(itemRoot);
      if (component) components.push(component as C);
    });
  });
  return components;
}
