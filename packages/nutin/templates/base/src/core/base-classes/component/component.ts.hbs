import { BaseComponent } from '../base-component/base-component.js';
import * as ConfigHelper from './helpers/config.helper.js';
import * as DataBindingHelper from './helpers/data-binding.helper.js';

export abstract class Component<T extends HTMLElement = HTMLElement, K = any> extends BaseComponent<T> {
  protected config: K;
  protected props: Nutin.ComponentProps;
  #templateFn: (config?: K) => Nutin.Template;
  #normalizeKeys: (keyof K)[];
  #defaults: Partial<K>;

  constructor({
    templateFn = () => '',
    mountTarget = '#app',
    tagName = 'div' as keyof HTMLElementTagNameMap,
    props = {},
    config,
    normalizeKeys = [],
    defaults = {},
    trustLevel,
  }: Nutin.ComponentOptions) {
    super({ mountTarget, tagName, trustLevel });

    this.config = ConfigHelper.setConfigValue(config, normalizeKeys);
    this.props = props;
    this.#templateFn = templateFn;
    this.#normalizeKeys = normalizeKeys as (keyof K)[];
    this.#defaults = defaults;
  }

  public getValues(): Record<string, string> {
    return DataBindingHelper.getDataBindingValues(this.element);
  }

  protected override generateTemplate(): Nutin.Template {
    return ConfigHelper.createNormalizedTemplate({
      config: this.config,
      defaults: this.#defaults,
      normalizeKeys: this.#normalizeKeys,
      templateFn: this.#templateFn,
    });
  }

  protected override onBeforeRender(): void {
    this.#applyProps();
  }

  protected override onAfterRender(): void {
    this.#applyDataBindings();
  }

  #applyProps(): void {
    if (this.props.className) {
      this.element.classList.add(...this.props.className.split(/\s+/).filter(Boolean));
    }
    if (this.props.style) {
      this.element.style.cssText = this.props.style;
    }
  }

  #applyDataBindings(): void {
    DataBindingHelper.applyDataBindings(this.element, this.props);
  }
}
