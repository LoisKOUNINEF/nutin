import { Component, I18nService, Navigation } from '../../../../core/index.js';

// Text rendered inside (or as attributes of) an <a11y-*> element is
// interpolated here rather than through data-i18n: data-i18n replaces an
// element's textContent after render, wiping the markup the element builds.
const t = (key: string) => I18nService.translate(`a11y-demo-elements.${key}`);

const templateFn = () => `__TEMPLATE_PLACEHOLDER__`;

export class A11yDemoElementsComponent extends Component {
  private focusableClicks = 0;

  constructor(mountTarget: HTMLElement) {
    super({templateFn, mountTarget});
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

  private countFocusable(): void {
    const output = this.element.querySelector('#a11y-demo-focusable-count');
    if (output) output.textContent = String(++this.focusableClicks);
  }
}
