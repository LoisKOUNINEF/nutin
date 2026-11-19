import type { KeepableComponentConfig } from './children.helper.js';
import * as SafeDom from './safe-dom.helper.js';

export function generateCatalog(config: Nutin.CatalogConfig, scope: Element = document.documentElement): Nutin.ComponentConfig[] {
  if (!config.items || config.items.length < 1) return [];

  const componentConfigs: Nutin.ComponentConfig[] = [];
  const containers = SafeDom.querySelectorAllOf(scope, `[data-catalog="${config.selector}"]`);

  containers.forEach((container) => {
    if (!container || !(container instanceof HTMLElement)) return;
    componentConfigs.push(...getComponentConfigItems(config, container))
  })

  return componentConfigs;
}

function getComponentConfigItems(config: Nutin.CatalogConfig, container: HTMLElement): Nutin.ComponentConfig[] {
  // SafeDom: a container that is a <form> may hold a control named innerHTML/appendChild.
  SafeDom.assign(container, 'innerHTML', '');
  const componentConfigs: Nutin.ComponentConfig[] = [];
  for (let i = 0; i < config.items.length; i++) {
    createElements(i, config, container);
    pushConfig(i, componentConfigs, config);
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

function pushConfig(index: number, componentConfigs: Nutin.ComponentConfig[], config: Nutin.CatalogConfig): void {
  const configWithIndex = getConfigWithIndex(config, index)

  const { props, defaults } = config;
  const options = { ...props, ...defaults };

  const componentConfig: KeepableComponentConfig = {
    selector: `${config.elementName}-${index}`,
    factory: (el) => new config.component(el, configWithIndex, options),
  };

  if (config.keepBy) {
    const item = config.items[index];
    componentConfig.keep = config.keepBy(item, index);
    componentConfig.scope = `catalog:${config.selector}:${config.elementName}`;
    componentConfig.keepIf = { item, options, component: config.component };
  }

  componentConfigs.push(componentConfig);
}

function getConfigWithIndex(config: Nutin.CatalogConfig, index: number): Nutin.CatalogItemConfig {
  const item = config.items[index];
  return (item && typeof item === 'object')
    ? { ...(item as object), index: index }
    : { value: item, index: index };    
}
