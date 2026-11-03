import type { TabsElement } from 'a11y-elements/components/tabs/element';
import type { ValueElement } from 'a11y-elements/core';
import { Component, I18nService, Navigation, html } from '../../../../core/index.js';

// Text rendered inside (or as attributes of) an <a11y-*> element is
// interpolated here rather than through data-i18n: data-i18n replaces an
// element's textContent after render, wiping the markup the element builds.
const translate = (key: string) => I18nService.translate(`a11y-demo-elements.${key}`);

const templateFn = () => html`__TEMPLATE_PLACEHOLDER__`;

// The value elements shown in the "getValue() / setValue()" section, by id, with
// the value each one starts with in the template (what Reset restores).
const VALUE_ELEMENTS: ReadonlyArray<readonly [id: string, initial: unknown]> = [
  ['a11y-demo-toppings', []],
  ['a11y-demo-plan', 'basic'],
  ['a11y-demo-framework', 'nutin'],
  ['a11y-demo-notifications', true],
];

type DemoValueElement = HTMLElement & Partial<ValueElement<unknown>>;

export class A11yDemoElementsComponent extends Component {
  private focusableClicks = 0;
  private cardLinkButtonClicks = 0;

  constructor(mountTarget: HTMLElement) {
    super({templateFn, mountTarget});
  }

  protected override onAfterRender(): void {
    // A plain property, not an attribute: since 0.2.0, properties set before
    // the element is upgraded are kept, so load order doesn't matter here.
    const username = this.element.querySelector('#a11y-demo-username') as (HTMLElement & { validators?: unknown }) | null;
    if (username) username.validators = [(value: string) => (/\s/.test(value) ? translate('input-username-no-spaces') : null)];

    // Called on user changes only: not by select() or `selected`.
    const tabs = this.element.querySelector('#a11y-demo-tabs') as (HTMLElement & Partial<Pick<TabsElement, 'onChange'>>) | null;
    if (tabs) tabs.onChange = (name) => this.setText('#a11y-demo-tabs-status', `${translate('tabs-selected')} ${name}`);

    // Called on user changes only: setValue() (the Reset button) is silent.
    for (const [id] of VALUE_ELEMENTS) {
      const element = this.valueElement(id);
      if (element) element.onChange = (value) => this.setText('#a11y-demo-values-change', `${element.localName}: ${JSON.stringify(value)}`);
    }
    super.onAfterRender();
  }

  private valueElement(id: string): DemoValueElement | null {
    return this.element.querySelector(`#${id}`);
  }

  private setText(selector: string, text: string): void {
    const output = this.element.querySelector(selector);
    if (output) output.textContent = text;
  }

  // Optional calls: the methods only exist once the element is upgraded.
  private readValues(): void {
    const lines = VALUE_ELEMENTS.map(([id]) => {
      const element = this.valueElement(id);
      return `${element?.localName ?? id}: ${JSON.stringify(element?.getValue?.())}`;
    });
    this.setText('#a11y-demo-values-output', lines.join('\n'));
  }

  private resetValues(): void {
    for (const [id, initial] of VALUE_ELEMENTS) this.valueElement(id)?.setValue?.(initial);
    this.readValues();
  }

  private _navigateTo(href: string): void {
    Navigation.navigateTo(href);
  }

  private stepProgress(): void {
    const progress = this.element.querySelector('#a11y-demo-progress');
    if (!progress) return;
    const value = Number(progress.getAttribute('value') ?? 0);
    progress.setAttribute('value', String(value >= 100 ? 0 : value + 20));
  }

  // Only reached once every field is valid: an invalid submit is blocked
  // natively, and a11y-input shows its errors and focuses the first one.
  private submitDemoForm(event: SubmitEvent): void {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    form.reset();
    const status = this.element.querySelector('#a11y-demo-form-status');
    if (status) status.textContent = translate('input-submitted');
  }

  private countFocusable(): void {
    const output = this.element.querySelector('#a11y-demo-focusable-count');
    if (output) output.textContent = String(++this.focusableClicks);
  }

  // A control inside an <a11y-card-link> keeps its own click: the card doesn't forward it to the link.
  private countCardLinkButton(): void {
    const output = this.element.querySelector('#a11y-demo-card-link-count');
    if (output) output.textContent = String(++this.cardLinkButtonClicks);
  }
}
