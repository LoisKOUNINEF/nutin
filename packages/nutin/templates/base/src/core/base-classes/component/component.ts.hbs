import { BaseComponent, ButtonManager, BaseButton, BaseComponentOptions } from '../../index.js';
import { ConfigHelper } from './helpers/config.helper.js';
import { DataBindingHelper } from './helpers/data-binding.helper.js';

export interface ComponentButton extends BaseButton {
  // if needed for Component-specific properties
}

export interface ComponentProps {
  // Common HTML attributes - extend as needed
  className?: string;
  style?: string;
  textContent?: string;
  
  // Form field bindings - extend as needed
  name?: string;
  email?: string;
  
  // Dynamic buttons
  buttons?: ComponentButton[];
  
  // Allow for additional data-bind attributes
  [key: string]: any;
}

export interface ComponentOptions<K = any> extends BaseComponentOptions {
  props?: ComponentProps;
  config?: K;
  defaults?: Partial<K>;
  templateFn?: (config?: K) => string;
  normalizeKeys?: (keyof K)[];
}

/**
 * ```typescript
interface ComponentOptions<K = any> extends BaseComponentOptions {
  props?: ComponentProps;
  config?: K;
  defaults?: Partial<K>;
  templateFn?: (config?: K) => string;
  normalizeKeys?: (keyof K)[];
}
  ```
*/
export abstract class Component<T extends HTMLElement = HTMLElement, K = any> extends BaseComponent<T> {
  protected config: K;
  protected props: ComponentProps;
  private buttonManager: ButtonManager;
  private _templateFn: (config?: K) => string;
  private _normalizeKeys: (keyof K)[];
  private _defaults: Partial<K>;

  constructor({
    templateFn = () => '',
    mountTarget = '#app',
    tagName = 'div' as keyof HTMLElementTagNameMap,
    props = {},
    config,
    normalizeKeys = [],
    defaults = {},
    trustLevel,
  }: ComponentOptions) {
    super({ mountTarget, tagName, trustLevel });

    this.config = ConfigHelper.setConfigValue(config, normalizeKeys);
    this.props = props;
    this._templateFn = templateFn;
    this._normalizeKeys = normalizeKeys as (keyof K)[];
    this._defaults = defaults;
    this.buttonManager = new ButtonManager(
      this,
      this.props.buttons,
      { containerClassName: 'component-buttons' }
    );
  }

  public getValues(): Record<string, string> {
    return DataBindingHelper.getDataBindingValues(this.element);
  }

  protected override generateTemplate(): string {
    return ConfigHelper.createNormalizedTemplate({
      config: this.config,
      defaults: this._defaults,
      normalizeKeys: this._normalizeKeys,
      templateFn: this._templateFn,
    });
  }

  protected override onBeforeRender(): void {
    this.applyProps();
  }

  protected override compose(): void {
    this.syncDynamicButtons();
    super.compose();
  }

  private applyProps(): void {
    if (this.props.className) {
      this.element.classList.add(this.props.className);
    }
    if (this.props.style) {
      this.element.style.cssText = this.props.style;
    }
    this.applyDataBindings();
  }

  private syncDynamicButtons(): void {
    this.buttonManager.appendTo(this.element);
  }

  private applyDataBindings(): void {
    DataBindingHelper.applyDataBindings(this.element, this.props);
  }
}
