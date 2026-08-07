import { Component, ComponentProps } from '../../../core/index.js';
import { FormControlHelper } from '../utils/index.js';

export interface IRadioOption {
  value: string;
  labelText?: string;
  labelKey?: string;
  checked?: boolean;
  disabled?: boolean;
  id?: string;
}

export interface IRadioGroupConfig {
  name: string;
  options: IRadioOption[];
  legendKey?: string;
  legendText?: string;
  disabled?: boolean;
  required?: boolean;
  onChange?: (value: string) => void;
}

const normalizeKeys: (keyof IRadioGroupConfig)[] = ['legendKey', 'legendText'];

export class RadioGroupComponent extends Component<HTMLFieldSetElement, IRadioGroupConfig> {
  constructor(mountTarget: HTMLElement, config: IRadioGroupConfig, props?: ComponentProps) {
    super({ mountTarget, config, tagName: 'fieldset', normalizeKeys, props });
  }

  protected override onBeforeRender(): void {
    super.onBeforeRender();
    this.element.classList.add('app-radio-group');
    if (this.config.disabled) {
      this.element.disabled = true;
    }
  }

  protected override generateTemplate(): string {
    const { name, options, legendKey, legendText, required } = this.config;

    const legend = `<legend class="radio-group__legend" data-optional="${legendKey || legendText}" data-i18n="${legendKey}">${legendText}</legend>`;

    const optionItems = options.map((opt, i) => {
      const inputAttrs = [
        'type="radio"',
        'class="radio__input"',
        `name="${name}"`,
        `value="${opt.value}"`,
        opt.id      ? `id="${opt.id}"`       : `id="${name}-${i}"`,
        opt.checked  ? 'checked'              : '',
        opt.disabled ? 'disabled'             : '',
        required     ? 'required'             : '',
      ].filter(Boolean).join(' ');

      return `<label class="radio-group__option"><input ${inputAttrs}>${FormControlHelper.renderLabel(opt.labelKey ?? '', opt.labelText ?? '', 'radio__label')}</label>`;
    }).join('');

    return `${legend}<div class="radio-group__options">${optionItems}</div>`;
  }

  protected override onAfterRender(): void {
    if (typeof this.config.onChange !== 'function') return;
    const onChange = this.config.onChange;
    const handler: EventListener = (e) => {
      const target = e.target as HTMLInputElement;
      if (target.type === 'radio' && target.checked) onChange(target.value);
    };
    this.element.addEventListener('change', handler);
    this.eventListeners.push([this.element, 'change', handler]);
  }

  public getValue(): string {
    return this.element.querySelector<HTMLInputElement>('.radio__input:checked')?.value ?? '';
  }

  public setValue(value: string): void {
    const input = this.element.querySelector<HTMLInputElement>(`.radio__input[value="${value}"]`);
    if (input) input.checked = true;
  }
}
