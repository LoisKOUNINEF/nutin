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

  constructor({
    templateFn = () => '',
    mountTarget = '#app',
    tagName = 'div' as keyof HTMLElementTagNameMap,
    props = {},
    config,
    normalizeKeys = [],
    defaults = {},
  }: ComponentOptions) {
    const template = ConfigHelper.createNormalizedTemplate({
      config, defaults, normalizeKeys, templateFn,
    });
    super({template, mountTarget, tagName});

    this.config = ConfigHelper.setConfigValue(config, normalizeKeys);
    this.props = props;
    this.buttonManager = this.createButtonManager();
  }

  public getValues(): Record<string, string> {
    return DataBindingHelper.getDataBindingValues(this.element);
  }

  public override render(): HTMLElement {
    this.applyProps();
    this.appendDynamicButtons();
    this.autoBindEvents();
    this.parseDataAttributes();
    return super.render();
  }

  private createButtonManager(): ButtonManager {
    return new ButtonManager(
      this, 
      this.props.buttons, 
      { containerClassName: 'component-buttons' }
    );
  }

  private applyProps(): void {
    if (this.props.className) {
      this.element.classList.add(this.props.className);
    }
    if (this.props.style) {
      this.element.style = this.props.style;
    }
    this.applyDataBindings();
  }

  private appendDynamicButtons(): void {
    this.buttonManager.appendTo(this.element);
  }

  private applyDataBindings(): void {
    DataBindingHelper.applyDataBindings(this.element, this.props);
  }
}
