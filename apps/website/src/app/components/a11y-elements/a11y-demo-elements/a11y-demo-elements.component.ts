import { Component, I18nService, Navigation, html } from '../../../../core/index.js';

// Text rendered inside (or as attributes of) an <a11y-*> element is
// interpolated here rather than through data-i18n: data-i18n replaces an
// element's textContent after render, wiping the markup the element builds.
const translate = (key: string) => I18nService.translate(`a11y-demo-elements.${key}`);

const templateFn = () => html`__TEMPLATE_PLACEHOLDER__`;

export class A11yDemoElementsComponent extends Component {
  private focusableClicks = 0;

  constructor(mountTarget: HTMLElement) {
    super({templateFn, mountTarget});
  }

  protected override onAfterRender(): void {
    // A plain property, not an attribute: since 0.2.0, properties set before
    // the CDN bundle upgrades the element are kept, so load order doesn't matter here.
    const username = this.element.querySelector('#a11y-demo-username') as (HTMLElement & { validators?: unknown }) | null;
    if (username) username.validators = [(value: string) => (/\s/.test(value) ? translate('input-username-no-spaces') : null)];
    super.onAfterRender();
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
}
