import { Component, Navigation, html } from '../../../../core/index.js';

const templateFn = () => html`__TEMPLATE_PLACEHOLDER__`;

export class A11yElementsIndexComponent extends Component {
  constructor(mountTarget: HTMLElement) {
    super({templateFn, mountTarget});
  }

  // Bound to each card's title link; <a11y-card-link> forwards clicks elsewhere on the card to it.
  private navigateTo(href: string) {
    Navigation.navigateTo(href);
  }
}
