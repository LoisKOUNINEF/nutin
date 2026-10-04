import { Component, Navigation, html } from '../../../core/index.js';

const templateFn = () => html`__TEMPLATE_PLACEHOLDER__`;

export class ReadMoreComponent extends Component {
  constructor(mountTarget: HTMLElement) {
    super({templateFn, mountTarget});
  }

  private navigateTo(slug: string) {
    Navigation.navigateTo(`/articles/${slug}`);
  }
}
