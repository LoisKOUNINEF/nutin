import { Component, Navigation, html } from '../../../core/index.js';

const templateFn = () => html`__TEMPLATE_PLACEHOLDER__`;

export class HomeExtrasComponent extends Component {
  constructor(mountTarget: HTMLElement) {
    super({templateFn, mountTarget});
  }

  // The cards' data-event="click:navigateTo:<path>" is bound to this component: a parent
  // view doesn't bind handlers inside its children's markup.
  private navigateTo(path: string): void {
    Navigation.navigateTo(`/${path}`);
  }
}
