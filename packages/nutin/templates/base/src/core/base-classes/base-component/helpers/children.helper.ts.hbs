import type { BaseComponent } from '../base-component.js';
import { DomHelper } from './dom.helper.js';

// What a catalog item was built from: a kept item must still match it.
export interface ReuseState {
  item: unknown;
  options: Record<string, unknown>;
  component: unknown;
}

// Internal fields CatalogHelper sets on top of the public ComponentConfig.
export interface ReusableComponentConfig extends ComponentConfig {
  scope?: string;
  reuseIf?: ReuseState;
}

interface KeyedChild {
  instance: BaseComponent;
  reuseIf?: ReuseState;
}

export interface ChildRegistry {
  keyed: Map<string, KeyedChild>;
  unkeyed: BaseComponent[];
  reused: BaseComponent[];
}

interface Placement {
  config: ReusableComponentConfig;
  placeholder: HTMLElement;
  id?: string;
  kept?: KeyedChild;
}

export class ChildrenHelper {
  public static createRegistry(): ChildRegistry {
    return { keyed: new Map(), unkeyed: [], reused: [] };
  }

  // Keyed children whose identity is unchanged are moved into their new
  // placeholder as-is; everything else is destroyed and recreated.
  public static addChildren(
    component: BaseComponent,
    element: HTMLElement,
    registry: ChildRegistry
  ): void {
    const placements = this.matchPlaceholders(component.registerChildren(), element, registry);
    this.destroyUnkept(registry, placements);

    // Every kept child moves before any new one renders, so move targets are
    // prepared once rather than after each DOM change.
    const kept = placements.filter(({ kept }) => kept);
    kept.forEach(({ kept, placeholder }) => DomHelper.prepareMoveTarget(placeholder.parentNode, kept!.instance.getElement()));
    kept.forEach(placement => this.reuse(placement, registry));
    placements.filter(({ kept }) => !kept).forEach(placement => this.create(placement, registry));
  }

  public static getKeyedElements(registry: ChildRegistry): HTMLElement[] {
    return Array.from(registry.keyed.values(), ({ instance }) => instance.getElement());
  }

  public static destroyChildren(registry: ChildRegistry): void {
    registry.unkeyed.forEach(child => child.destroy());
    registry.keyed.forEach(({ instance }) => instance.destroy());
    registry.unkeyed = [];
    registry.keyed.clear();
    registry.reused = [];
  }

  private static matchPlaceholders(
    configs: ReusableComponentConfig[],
    element: HTMLElement,
    registry: ChildRegistry
  ): Placement[] {
    const placements: Placement[] = [];
    const seen = new Set<string>();

    configs.forEach(config => {
      element.querySelectorAll(`[data-component="${config.selector}"]`).forEach((placeholder, occurrence) => {
        if (!(placeholder instanceof HTMLElement)) return;
        const id = this.getId(config, occurrence, seen);
        const previous = id === undefined ? undefined : registry.keyed.get(id);
        const kept = previous && this.canReuse(previous, config) ? previous : undefined;
        placements.push({ config, placeholder, id, kept });
      });
    });

    return placements;
  }

  private static getId(config: ReusableComponentConfig, occurrence: number, seen: Set<string>): string | undefined {
    if (config.key === undefined) return undefined;

    const scope = config.scope ?? config.selector;
    const id = JSON.stringify([scope, config.key, occurrence]);
    if (seen.has(id)) {
      console.warn(`Duplicate child key "${config.key}" in "${scope}" - it will be recreated on every render.`);
      return undefined;
    }
    seen.add(id);
    return id;
  }

  private static canReuse(previous: KeyedChild, config: ReusableComponentConfig): boolean {
    const before = previous.reuseIf;
    const after = config.reuseIf;
    if (!before || !after) return before === after;

    return before.component === after.component
      && this.shallowEqual(before.item, after.item)
      && this.shallowEqual(before.options, after.options);
  }

  private static destroyUnkept(registry: ChildRegistry, placements: Placement[]): void {
    const keptIds = new Set(placements.filter(({ kept }) => kept).map(({ id }) => id));

    registry.unkeyed.forEach(child => child.destroy());
    registry.unkeyed = [];
    registry.reused = [];
    registry.keyed.forEach((entry, id) => {
      if (keptIds.has(id)) return;
      entry.instance.destroy();
      registry.keyed.delete(id);
    });
  }

  private static reuse({ config, placeholder, kept }: Placement, registry: ChildRegistry): void {
    DomHelper.replacePlaceholder(kept!.instance.getElement(), placeholder);
    kept!.reuseIf = config.reuseIf;
    registry.reused.push(kept!.instance);
  }

  private static create({ config, placeholder, id }: Placement, registry: ChildRegistry): void {
    const child = config.factory(placeholder);
    child.render();
    if (id === undefined) registry.unkeyed.push(child);
    else registry.keyed.set(id, { instance: child, reuseIf: config.reuseIf });
  }

  private static shallowEqual(a: unknown, b: unknown): boolean {
    if (Object.is(a, b)) return true;
    if (!a || !b || typeof a !== 'object' || typeof b !== 'object') return false;
    if (Array.isArray(a) !== Array.isArray(b)) return false;

    const aRecord = a as Record<string, unknown>;
    const bRecord = b as Record<string, unknown>;
    const aKeys = Object.keys(aRecord);
    return aKeys.length === Object.keys(bRecord).length
      && aKeys.every(key => Object.prototype.hasOwnProperty.call(bRecord, key) && Object.is(aRecord[key], bRecord[key]));
  }
}
