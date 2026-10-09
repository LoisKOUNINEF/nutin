import type { BaseComponent } from '../base-component.js';
import * as DomHelper from './dom.helper.js';

// What a catalog item was built from: a kept item must still match it.
export interface KeepCondition {
  item: unknown;
  options: Record<string, unknown>;
  component: unknown;
}

// Internal fields CatalogHelper sets on top of the public ComponentConfig.
export interface KeepableComponentConfig extends Nutin.ComponentConfig {
  scope?: string;
  keepIf?: KeepCondition;
}

interface KeepableChild {
  instance: BaseComponent;
  keepIf?: KeepCondition;
}

export interface ChildRegistry {
  keepable: Map<string, KeepableChild>;
  rebuilt: BaseComponent[];
  kept: BaseComponent[];
}

interface Placement {
  config: KeepableComponentConfig;
  placeholder: HTMLElement;
  id?: string;
  kept?: KeepableChild;
}

export function createRegistry(): ChildRegistry {
  return { keepable: new Map(), rebuilt: [], kept: [] };
}

// Children whose keep value is unchanged are moved into their new
// placeholder as-is; everything else is destroyed and recreated.
export function addChildren(
  component: BaseComponent,
  element: HTMLElement,
  registry: ChildRegistry
): void {
  const placements = matchPlaceholders(component.registerChildren(), element, registry);
  destroyUnkept(registry, placements);

  // Every kept child moves before any new one renders, so move targets are
  // prepared once rather than after each DOM change.
  const kept = placements.filter(({ kept }) => kept);
  kept.forEach(({ kept, placeholder }) => DomHelper.prepareMoveTarget(placeholder.parentNode, kept!.instance.getElement()));
  kept.forEach(placement => keep(placement, registry));
  placements.filter(({ kept }) => !kept).forEach(placement => create(placement, registry));
}

export function getKeepableElements(registry: ChildRegistry): HTMLElement[] {
  return Array.from(registry.keepable.values(), ({ instance }) => instance.getElement());
}

export function destroyChildren(registry: ChildRegistry): void {
  registry.rebuilt.forEach(child => child.destroy());
  registry.keepable.forEach(({ instance }) => instance.destroy());
  registry.rebuilt = [];
  registry.keepable.clear();
  registry.kept = [];
}

function matchPlaceholders(
  configs: KeepableComponentConfig[],
  element: HTMLElement,
  registry: ChildRegistry
): Placement[] {
  const placements: Placement[] = [];
  const seen = new Set<string>();

  configs.forEach(config => {
    element.querySelectorAll(`[data-component="${config.selector}"]`).forEach((placeholder, occurrence) => {
      if (!(placeholder instanceof HTMLElement)) return;
      const id = getId(config, occurrence, seen);
      const previous = id === undefined ? undefined : registry.keepable.get(id);
      const kept = previous && canKeep(previous, config) ? previous : undefined;
      placements.push({ config, placeholder, id, kept });
    });
  });

  return placements;
}

function getId(config: KeepableComponentConfig, occurrence: number, seen: Set<string>): string | undefined {
  if (config.keep === undefined) return undefined;

  const scope = config.scope ?? config.selector;
  const id = JSON.stringify([scope, config.keep, occurrence]);
  if (seen.has(id)) {
    console.warn(`Duplicate child keep value "${config.keep}" in "${scope}" - it will be recreated on every render.`);
    return undefined;
  }
  seen.add(id);
  return id;
}

function canKeep(previous: KeepableChild, config: KeepableComponentConfig): boolean {
  const before = previous.keepIf;
  const after = config.keepIf;
  if (!before || !after) return before === after;

  return before.component === after.component
    && shallowEqual(before.item, after.item)
    && shallowEqual(before.options, after.options);
}

function destroyUnkept(registry: ChildRegistry, placements: Placement[]): void {
  const keptIds = new Set(placements.filter(({ kept }) => kept).map(({ id }) => id));

  registry.rebuilt.forEach(child => child.destroy());
  registry.rebuilt = [];
  registry.kept = [];
  registry.keepable.forEach((entry, id) => {
    if (keptIds.has(id)) return;
    entry.instance.destroy();
    registry.keepable.delete(id);
  });
}

function keep({ config, placeholder, kept }: Placement, registry: ChildRegistry): void {
  DomHelper.replacePlaceholder(kept!.instance.getElement(), placeholder);
  kept!.keepIf = config.keepIf;
  registry.kept.push(kept!.instance);
}

function create({ config, placeholder, id }: Placement, registry: ChildRegistry): void {
  const child = config.factory(placeholder);
  child.render();
  if (id === undefined) registry.rebuilt.push(child);
  else registry.keepable.set(id, { instance: child, keepIf: config.keepIf });
}

function shallowEqual(a: unknown, b: unknown): boolean {
  if (Object.is(a, b)) return true;
  if (!a || !b || typeof a !== 'object' || typeof b !== 'object') return false;
  if (Array.isArray(a) !== Array.isArray(b)) return false;

  const aRecord = a as Record<string, unknown>;
  const bRecord = b as Record<string, unknown>;
  const aKeys = Object.keys(aRecord);
  return aKeys.length === Object.keys(bRecord).length
    && aKeys.every(key => Object.prototype.hasOwnProperty.call(bRecord, key) && Object.is(aRecord[key], bRecord[key]));
}
