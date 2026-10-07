import { Component, Navigation, html } from '../../../core/index.js';

const templateFn = () => html`__TEMPLATE_PLACEHOLDER__`;

export class HomeExtrasComponent extends Component {
  constructor(mountTarget: HTMLElement) {
    super({templateFn, mountTarget});
  }

  // Each card's title link has data-event="click:navigateTo:@attr:href", bound to this
  // component (a parent view doesn't bind handlers inside its children's markup).
  // <a11y-card-link> forwards clicks elsewhere on the card to that link.
  private navigateTo(href: string): void {
    Navigation.navigateTo(href);
  }
}
